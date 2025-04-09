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

    // Fetch the order
    const order = await db
      .select()
      .from(orderTable)
      .where(eq(orderTable.id, orderId))
      .limit(1);

    if (!order || order.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Fetch the customer details
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
      customer,
      name,
      email,
      phoneNumber,
      deliveryLocation,
      paymentMethod,
      promoCode,
    } = await request.json();

    console.log("Updating Order with ID:", orderId);

    // Validate required fields
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
    // const payment = await db
    //   .select()
    //   .from(paymentTable)
    //   .where(eq(paymentTable.orderId, orderId));

    // const paymentStatus = payment.length > 0 ? payment[0].status : "pending";
    
    // only allow updates for pending or failed payments
    if (paymentStatus === "completed") {
      return NextResponse.json(
        { error: "Cannot modify order with completed payment" },
        { status: 400 }
      );
    }

    // validate and apply promo code if provided
    let discountAmount = 0;
    let validatedPromo = null;
    
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
        currentStock: productData.stockAvailability
      });
    }

    // apply total discount
    totalAmount -= totalDiscountAmount;

    // start transaction
    const result = await db.transaction(async (tx) => {
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

      // delete existing order products
      await tx.delete(orderProductTable).where(eq(orderProductTable.orderId, orderId));

      // delete existing sales records
      await tx.delete(salesTable).where(eq(salesTable.orderId, orderId));

      // delete existing payment record
      await tx.delete(paymentTable).where(eq(paymentTable.orderId, orderId));

      // add new order products and update stock
      for (const product of productDetails) {
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
          stockAvailability: product.currentStock - product.quantity,
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
      });
    }
    return NextResponse.json({
      message: "Order updated successfully",
      orderId,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// delete an order
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orderId = params.id;
    console.log("Deleting Order with ID:", orderId);

    // delete associated payment records
    await db.delete(paymentTable).where(eq(paymentTable.orderId, orderId));

    // delete associated order products
    await db.delete(orderProductTable).where(eq(orderProductTable.orderId, orderId));

    // delete the order
    await db.delete(orderTable).where(eq(orderTable.id, orderId));

    return NextResponse.json({ message: "Order deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
