import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { db } from "@/src/index";
import { orderTable } from "@/src/db/schema/order";
import { orderProductTable } from "@/src/db/schema/orderproduct";
import { customerTable } from "@/src/db/schema/customer";
import { productTable } from "@/src/db/schema/product";
import { paymentTable } from "@/src/db/schema/payment";
import { marketingTable } from "@/src/db/schema/marketing";
import { salesTable } from "@/src/db/schema/sales";
import { and, eq, sql } from "drizzle-orm";
import axios from "axios";

// fetch order data
export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // fetch all orders for the current business
    const orders = await db
      .select()
      .from(orderTable)
      .where(eq(orderTable.businessId, session.user.businessId));

    // fetch order products and customer details for each order
    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        // fetch order products
        const orderProducts = await db
          .select()
          .from(orderProductTable)
          .where(eq(orderProductTable.orderId, order.id));

        // fetch product details for each order product
        const products = await Promise.all(
          orderProducts.map(async (orderProduct) => {
            const [product] = await db
              .select()
              .from(productTable)
              .where(eq(productTable.id, orderProduct.productId));

            return {
              ...orderProduct,
              productName: product.productName,
              unitPrice: product.unitPrice,
            };
          })
        );

        // fetch customer details
        const [customer] = await db
          .select()
          .from(customerTable)
          .where(eq(customerTable.id, order.customerId));

        return {
          ...order,
          products,
          customer,
        };
      })
    );

    return NextResponse.json(populatedOrders, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" }), 
      { status: 500,
    };
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

// add new order data
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      products,
      customer,
      name,
      email,
      phoneNumber,
      deliveryLocation,
      paymentMethod,
      promoCode,
    } = body;

    // validate required fields
    if (
      !products ||
      !products.length ||
      !deliveryLocation ||
      !name ||
      !email ||
      !phoneNumber
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let customerId = customer;

    // if customer ID is not provided, check for an existing customer or create a new one
    if (!customerId) {
      const [existingCustomer] = await db
        .select()
        .from(customerTable)
        .where(
          and(
            eq(customerTable.phoneNumber, phoneNumber),
            eq(customerTable.email, email),
            eq(customerTable.businessId, session.user.businessId)
          )
        );

      if (existingCustomer) {
        // use the existing customer
        customerId = existingCustomer.id;
      } else {
        try {
          // create a new customer
          const [newCustomer] = await db
            .insert(customerTable)
            .values({
              businessId: session.user.businessId,
              name,
              phoneNumber,
              email,
              addedDate: new Date(),
              totalOrders: 1,
            })
            .returning();

          customerId = newCustomer.id;
        } catch (error) {
          if (error.code === "23505") {
            // handle duplicate email error
            return NextResponse.json(
              { error: "Customer with this email already exists" },
              { status: 400 }
            );
          } else {
            console.error("Error creating customer:", error);
            return NextResponse.json(
              { error: "Internal server error" },
              { status: 400 }
            );
          }
        }
      }
    } else {
      // increment totalOrders for the existing customer
      await db
        .update(customerTable)
        .set({
          totalOrders: sql`${customerTable.totalOrders} + 1`,
        })
        .where(eq(customerTable.id, customerId));
    }

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

    // calculate the total amount for the order and validate product stock
    let totalAmount = 0;
    let totalDiscountAmount = 0;

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
      totalAmount += productTotal;
      
      // calculate discount for this product if promo exists
      if (validatedPromo) {
        const productDiscount = productTotal * (Number(validatedPromo.discountPercent) / 100);
        totalDiscountAmount += productDiscount;
      }
    }

    // apply total discount
    totalAmount -= totalDiscountAmount;

    // Second Step: Actual Order Processing
    // create the order
    const [newOrder] = await db
      .insert(orderTable)
      .values({
        businessId: session.user.businessId,
        customerId: customerId,
        customerName: name,
        phoneNumber,
        deliveryLocation,
        email,
        totalAmount,
        discountPercent: validatedPromo ? validatedPromo.discountPercent : 0,
        discountAmount: totalDiscountAmount,
        promoCode: validatedPromo ? promoCode : null,
        orderDate: new Date(),
      })
      .returning();

    // add order products, deduct stock, and record sales
    for (const product of products) {
      const [productData] = await db
        .select()
        .from(productTable)
        .where(eq(productTable.id, product.productId));

      const productTotal = productData.unitPrice * product.quantity;
      let productDiscount = 0;

      if (validatedPromo) {
        productDiscount =
          productTotal * (Number(validatedPromo.discountPercent) / 100);
      }

      // add order product
      await db.insert(orderProductTable).values({
        orderId: newOrder.id,
        productId: product.productId,
        quantity: product.quantity,
        unitPrice: productData.unitPrice,
        amount: productTotal - productDiscount,
      });

      // deduct the stock from the product table
      await db
        .update(productTable)
        .set({
          stockAvailability: productData.stockAvailability - product.quantity,
        })
        .where(eq(productTable.id, product.productId));
        
      // insert sales record into the sales table
      await db.insert(salesTable).values({
        businessId: session.user.businessId,
        orderId: newOrder.id,
        productId: product.productId,
        quantitySold: product.quantity,
        revenue: productTotal - productDiscount,      
        saleDate: new Date(),
        discountAmount: productDiscount,
      });
    }

    // create a payment record
    const [newPayment] = await db
      .insert(paymentTable)
      .values({
        orderId: newOrder.id,
        pidx: "NA",
        amount: totalAmount,
        status: "pending",
        paymentDate: new Date(),
        paymentMethod: paymentMethod,
      })
      .returning();

    // if payment method is Khalti, initiate Khalti payment
    if (paymentMethod === "Khalti") {
      try {
        const khaltiResponse = await axios.post(
          "https://dev.khalti.com/api/v2/epayment/initiate/",
          {
            return_url: "http://localhost:3000/api/payment/callback",
            website_url: "http://localhost:3000",
            amount: totalAmount * 100, // amount in paisa
            purchase_order_id: newOrder.id, // use the order ID as the purchase order ID
            purchase_order_name: `Order #${newOrder.id}`,
            customer_info: {
              name: name,
              email: email,
              phone: phoneNumber,
            },
          },
          {
            headers: {
              Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
            },
            timeout: 5000
          }
        );

        // update payment record with Khalti details
        await db
          .update(paymentTable)
          .set({
            pidx: khaltiResponse.data.pidx, // payment ID from Khalti
          })
          .where(eq(paymentTable.id, newPayment.id));

        console.log("Khalti Payment URL:", khaltiResponse.data.payment_url);

        // return the Khalti payment URL to the client
        return NextResponse.json(
          {
            message: "Order created successfully",
            order: newOrder,
            payment_url: khaltiResponse.data.payment_url,
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
          .where(eq(paymentTable.id, newPayment.id));

        // return success response for non-Khalti payments
        return NextResponse.json({
            message: "Order created successfully",
            order: newOrder,
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
        message: "Order created successfully",
        order: newOrder,
      },
      { status: 201,}
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}