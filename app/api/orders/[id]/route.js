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
import { and, eq, sql } from "drizzle-orm";
import axios from "axios";

// fetch order details by ID
export async function GET(request, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orderId = id;
    const {
      products,
      name,
      email,
      phoneNumber,
      deliveryLocation,
      paymentMethod,
      promoCode,
    } = await request.json();

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
    let discountAmount = 0;
    
    if (promoCode) {
      validatedPromo = await validatePromoCode(promoCode, session.user.businessId);
      
      if (!validatedPromo) {
        return NextResponse.json(
          { error: "Invalid or expired promo code" },
          { status: 400 }
        );
      }
    }

    // calculate the total amount and validate product stock
    let totalAmount = 0;
    let totalDiscountAmount = 0;
    const productDetails = [];

    for (const product of products) {
      const [productData] = await db
        .select()
        .from(productTable)
        .where(eq(productTable.id, product.productId));

      if (!productData) {
        return NextResponse.json(
          { error: `Product with ID ${product.productId} not found` },
          { status: 404 }
        );
      }

      const productTotal = productData.unitPrice * product.quantity;
      let productDiscount = 0;

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

      // verify stock for new quantities
      for (const product of productDetails) {
        const quantity = Number(product.quantity);
        if (isNaN(quantity)) {
          throw new Error(`Invalid quantity for product ${product.productId}`);
        }

        const [productData] = await tx.select()
          .from(productTable)
          .where(eq(productTable.id, product.productId));

        if (productData.stockAvailability < product.quantity) {
          throw new Error(`Insufficient stock for product ${product.productId}`);
        }
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

        // update product stock
        await tx.update(productTable)
        .set({
          stockAvailability: sql`${productTable.stockAvailability} - ${product.quantity}`
        })
        .where(eq(productTable.id, product.productId));

        // add sales record
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
              Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
            },
            timeout: 5000,
          }
        );

        // update payment record with Khalti details
        await db
          .update(paymentTable)
          .set({
            pidx: khaltiResponse.data.pidx,
            status: "pending",
          })
          .where(eq(paymentTable.orderId, orderId));

        return NextResponse.json({
          message: "Order updated successfully",
          orderId,
          payment_url: khaltiResponse.data.payment_url,
          totalAmount,
          discountAmount: totalDiscountAmount,
          discountPercent: validatedPromo ? validatedPromo.discountPercent : 0
        });

      } catch (error) {
        console.error("Khalti payment initiation failed:", error);
        await db.update(paymentTable)
          .set({
            status: "failed",
            paymentDetails: JSON.stringify({
              error: error.message,
              response: error.response?.data,
            }),
          })
          .where(eq(paymentTable.orderId, orderId));

        return NextResponse.json({
          message: "Order updated but payment initiation failed",
          orderId,
          warning: "Payment gateway unavailable. Please try again later.",
          totalAmount,
          discountAmount: totalDiscountAmount,
          discountPercent: validatedPromo ? validatedPromo.discountPercent : 0
        }, { status: 200 });
      }
    }

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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
