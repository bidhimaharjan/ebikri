import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { db } from "@/src/index";
import { productTable } from "@/src/db/schema/product";
import { orderTable } from "@/src/db/schema/order";
import { orderProductTable } from "@/src/db/schema/orderproduct";
import { paymentTable } from "@/src/db/schema/payment";
import { customerTable } from "@/src/db/schema/customer";
import { marketingTable } from "@/src/db/schema/marketing";
import { salesTable } from "@/src/db/schema/sales";
import { paymentSecretsTable } from "@/src/db/schema/payment_secret"
import { and, eq, sql } from "drizzle-orm";
import axios from "axios";

// fetch order details by ID
export async function GET(request, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const orderId = id;
    console.log("Fetching Order with ID:", orderId);

    // fetch the order
    const order = await db
      .select()
      .from(orderTable)
      .where(eq(orderTable.id, orderId))
      .limit(1);

    if (!order || order.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // fetch the customer details
    const customer = await db
      .select()
      .from(customerTable)
      .where(eq(customerTable.id, order[0].customerId))
      .limit(1);

    if (!customer || customer.length === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // fetch the products associated with the order
    const products = await db
      .select()
      .from(orderProductTable)
      .where(eq(orderProductTable.orderId, orderId));

    // fetch the payment status associated with the order
    const payment = await db
      .select()
      .from(paymentTable)
      .where(eq(paymentTable.orderId, orderId));

    console.log("Payment:", payment);

    // handle cases where no payment record exists
    const paymentStatus = payment.length > 0 ? payment[0].status : "pending";

    // create the response
    const response = {
      id: order[0].id,
      customer: {
        id: customer[0].id,
        name: customer[0].name,
        email: customer[0].email,
        phoneNumber: customer[0].phoneNumber,
      },
      products: products.map((product) => ({
        productId: product.productId,
        quantity: product.quantity,
      })),
      deliveryLocation: order[0].deliveryLocation,
      promoCode: order[0].promoCode,
      totalAmount: order[0].totalAmount,
      paymentStatus: paymentStatus,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// helper function to validate promo codes
async function validatePromoCode(promoCode, businessId) {
  if (!promoCode) return null;
  
  try {
    const [promo] = await db
      .select()
      .from(marketingTable)
      .where(
        and(
          eq(marketingTable.promoCode, promoCode),
          eq(marketingTable.businessId, businessId),
          sql`${marketingTable.startDate} <= NOW()`,
          sql`${marketingTable.endDate} >= NOW()`,
          eq(marketingTable.active, true)
        )
      );

    return promo || null;
  } catch (error) {
    console.error("Error validating promo code:", error);
    return null;
  }
}

// update an order
export async function PUT(request, { params }) {
  const { id } = await params;
  
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const orderId = id;
    const body = await request.json();
    const {
      products,
      name,
      email,
      phoneNumber,
      deliveryLocation,
      paymentMethod,
      promoCode,
    } = body;

    console.log("Updating Order with ID:", orderId);

    // validate required fields
    if (!products || !products.length || !deliveryLocation) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // check payment status first
    const [payment] = await db
      .select()
      .from(paymentTable)
      .where(eq(paymentTable.orderId, orderId));

    const paymentStatus = payment?.status || "pending";
    
    // only allow updates for pending or failed payments
    if (paymentStatus === "completed") {
      return NextResponse.json(
        { error: "Cannot modify order with completed payment" },
        { status: 400 }
      );
    }

    // get existing order products before any changes
    const existingOrderProducts = await db
      .select()
      .from(orderProductTable)
      .where(eq(orderProductTable.orderId, orderId));

    // validate and apply promo code if provided
    let validatedPromo = null;
    
    if (promoCode) {
      validatedPromo = await validatePromoCode(promoCode, session.user.businessId);
      
      if (!validatedPromo) {
        return NextResponse.json({ 
          error: "Invalid or expired promo code",
          promoCode: promoCode,
        },
          { status: 400 }
        );
      }
    }

    // calculate the total amount and validate product stock
    let totalAmount = 0;
    let totalDiscountAmount = 0;
    const productDetails = [];

    // First step: Validation and Calculation
    for (const product of products) {
      const [productData] = await db
        .select()
        .from(productTable)
        .where(eq(productTable.id, product.productId));

      if (!productData) {
        return NextResponse.json({ 
          error: `Product with ID ${product.productId} not found`,
          productId: product.productId,
        },
          { status: 404 }
        );
      }

      // check if there is enough stock
      if (productData.stockAvailability < product.quantity) {
        return NextResponse.json({
            error: `Insufficient stock for product ${product.productId}`,
            productId: product.productId,
            availableStock: productData.stockAvailability
          },
          { status: 400 }
        );
      }

      const productTotal = productData.unitPrice * product.quantity;
      let productDiscount = 0;

      // calculate discount for this product if promo exists
      if (validatedPromo) {
        productDiscount = productTotal * (Number(validatedPromo.discountPercent) / 100);
        totalDiscountAmount += productDiscount;
      }

      totalAmount += productTotal;
      productDetails.push({
        ...product,
        unitPrice: productData.unitPrice,
        amount: productTotal - productDiscount,
        // currentStock: productData.stockAvailability
      });
    }

    // apply total discount
    totalAmount -= totalDiscountAmount;

    // Second Step: Actual Order Processing
    // start transaction
    const result = await db.transaction(async (tx) => {
      // restore stock from existing order products
      for (const existingProduct of existingOrderProducts) {
        await tx.update(productTable)
          .set({
            stockAvailability: sql`${productTable.stockAvailability} + ${existingProduct.quantity}`
          })
          .where(eq(productTable.id, existingProduct.productId));
      }

      // delete existing order products
      await tx.delete(orderProductTable).where(eq(orderProductTable.orderId, orderId));

      // delete existing sales records
      await tx.delete(salesTable).where(eq(salesTable.orderId, orderId));

      // delete existing payment records
      await tx.delete(paymentTable).where(eq(paymentTable.orderId, orderId));
      
      // update the order
      await tx.update(orderTable)
        .set({
          customerName: name,
          phoneNumber,
          deliveryLocation,
          email,
          totalAmount,
          discountPercent: validatedPromo ? validatedPromo.discountPercent : 0,
          discountAmount: totalDiscountAmount,
          promoCode: validatedPromo ? promoCode : null,
        })
        .where(eq(orderTable.id, orderId));

      // add new order products and update stock
      for (const product of productDetails) {
        const quantity = Number(product.quantity);
        // add order product
        await tx.insert(orderProductTable).values({
          orderId,
          productId: product.productId,
          quantity: product.quantity,
          unitPrice: product.unitPrice,
          amount: product.amount,
        });

         // deduct the stock from the product table
        await tx.update(productTable)
        .set({
          stockAvailability: sql`${productTable.stockAvailability} - ${product.quantity}`
        })
        .where(eq(productTable.id, product.productId));

        // insert sales record into the sales table
        await tx.insert(salesTable).values({
          businessId: session.user.businessId,
          orderId: orderId,
          productId: product.productId,
          quantitySold: product.quantity,
          revenue: product.amount,
          saleDate: new Date(),
          discountAmount: product.amount - (product.unitPrice * product.quantity),
        });
      }

      // insert new payment record
      await tx.insert(paymentTable).values({
        orderId: orderId,
        pidx: "NA",
        paymentMethod,
        amount: totalAmount,
        status: "pending",
        paymentDate: new Date(),
        paymentMethod: paymentMethod,
      });

      return { success: true };
    });

    // if payment method is Khalti, initiate payment
    if (paymentMethod === "Khalti") {
      try {
        // fetch Khalti secret key from database
        const [paymentSecret] = await db
          .select()
          .from(paymentSecretsTable)
          .where(
            and(
              eq(paymentSecretsTable.userId, session.user.id),
              eq(paymentSecretsTable.paymentProvider, "Khalti")
            )
          );

        if (!paymentSecret?.liveSecretKey) {
          throw new Error("Khalti payment credentials not configured");
        }

        const khaltiResponse = await axios.post(
          "https://dev.khalti.com/api/v2/epayment/initiate/",
          {
            return_url: `${process.env.NEXTAUTH_URL}/api/payment/callback`,
            website_url: process.env.NEXTAUTH_URL,
            amount: totalAmount * 100, // amount in paisa
            purchase_order_id: orderId,
            purchase_order_name: `Order #${orderId}`,
            customer_info: {
              name,
              email,
              phone: phoneNumber,
            },
          },
          {
            headers: {
              Authorization: `Key ${paymentSecret.liveSecretKey}`,
            },
            timeout: 5000,
          }
        );

        // update payment record with Khalti details
        await db
          .update(paymentTable)
          .set({
            pidx: khaltiResponse.data.pidx, // payment ID from Khalti
            paymentLink: khaltiResponse.data.payment_url, // Khalti payment link
          })
          .where(eq(paymentTable.orderId, orderId));

        console.log("Khalti Payment URL:", khaltiResponse.data.payment_url);

        // return the Khalti payment URL to the client
        return NextResponse.json(
          {
            message: "Order updated successfully",
            orderId,
            payment_url: khaltiResponse.data.payment_url,
            totalAmount,
            discountAmount: totalDiscountAmount,
            discountPercent: validatedPromo
              ? validatedPromo.discountPercent
              : 0,
          },
          { status: 201 }
        );
      } catch (error) {
        console.error("Khalti payment initiation failed:", error);

        // update payment method to "Other" since Khalti failed
        await db
        .update(paymentTable)
        .set({
          paymentMethod: "Other",
          error_message: "Khalti payment initiation failed"
        })
        .where(eq(paymentTable.orderId, orderId));

        // return success response for non-Khalti payments
        return NextResponse.json({
            message: "Order updated successfully",
            orderId,
            totalAmount,
            discountAmount: totalDiscountAmount,
            discountPercent: validatedPromo ? validatedPromo.discountPercent : 0,
            khaltiFailed: true,
            error: "Khalti payment initiation failed",
            details: error.response?.data?.message || "Payment service unavailable"
          }, 
          { status: 201 } // still return 201 since order was created with offline payment
        );
      }
    }

    // return success response for non-Khalti payments
    return NextResponse.json({
      message: "Order updated successfully",
      orderId,
      totalAmount,
      discountAmount: totalDiscountAmount,
      discountPercent: validatedPromo ? validatedPromo.discountPercent : 0
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// delete an order
export async function DELETE(request, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const orderId = id;
    console.log("Deleting Order with ID:", orderId);

    // verify the order exists
    const [order] = await db
      .select()
      .from(orderTable)
      .where(eq(orderTable.id, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const customerId = order.customerId;

    // first check payment status
    const [payment] = await db
      .select()
      .from(paymentTable)
      .where(eq(paymentTable.orderId, orderId))
      .limit(1);

    const paymentStatus = payment?.status || "pending";
    console.log("Payment Status:", paymentStatus);
    
    // only allow deletion for pending or failed payments
    if (paymentStatus === "paid") {
      return NextResponse.json(
        { 
          error: "Cannot delete order with completed payment",
          message: "The payment of this order has been completed and cannot be deleted"
        },
        { status: 400 }
      );
    }

    // get the order products to restore stock
    const orderProducts = await db
      .select()
      .from(orderProductTable)
      .where(eq(orderProductTable.orderId, orderId));

    // start a transaction
    await db.transaction(async (tx) => {
      // restore product stock
      for (const product of orderProducts) {
        await tx.update(productTable)
          .set({
            stockAvailability: sql`${productTable.stockAvailability} + ${product.quantity}`
          })
          .where(eq(productTable.id, product.productId));
      }

      // delete associated payment records
      await tx.delete(paymentTable).where(eq(paymentTable.orderId, orderId));

      // delete associated sales records
      await tx.delete(salesTable).where(eq(salesTable.orderId, orderId));

      // delete associated order products
      await tx.delete(orderProductTable).where(eq(orderProductTable.orderId, orderId));

      // decrement totalOrders count for the customer
      await tx.update(customerTable)
      .set({
        totalOrders: sql`${customerTable.totalOrders} - 1`
      })
      .where(eq(customerTable.id, customerId));


      // delete the order
      await tx.delete(orderTable).where(eq(orderTable.id, orderId));
    });

    return NextResponse.json(
      { message: "Order deleted successfully" }, 
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error.message
      }, 
      { status: 500 });
  }
}
