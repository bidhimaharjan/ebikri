import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/src/index";
import { orderTable } from "@/src/db/schema/order";
import { orderProductTable } from "@/src/db/schema/orderproduct";
import { customerTable } from "@/src/db/schema/customer";
import { productTable } from "@/src/db/schema/product";
import { eq, and, sql } from "drizzle-orm";

// fetch order data
export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
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

    return new Response(JSON.stringify(populatedOrders), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}

// add new order data
export async function POST(request) {
    const session = await getServerSession(authOptions);
  
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }
  
    try {
      const body = await request.json();
      const { products, customer, name, email, phoneNumber, deliveryLocation } =
        body;
  
      // Validate required fields
      if (
        !products ||
        !products.length ||
        !deliveryLocation ||
        !name ||
        !email ||
        !phoneNumber
      ) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          {
            status: 400,
          }
        );
      }
  
      let customerId = customer;
  
      // If customer ID is not provided, check for an existing customer or create a new one
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
          // Use the existing customer
          customerId = existingCustomer.id;
        } else {
          try {
            // Create a new customer
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
              // Handle duplicate email error
              return new Response(
                JSON.stringify({ error: "Customer with this email already exists" }),
                { status: 400 }
              );
            } else {
              console.error("Error creating customer:", error);
              return new Response(
                JSON.stringify({ error: "Internal server error" }),
                { status: 500 }
              );
            }
          }
        }
      } else {
        // Increment totalOrders for the existing customer
        await db
          .update(customerTable)
          .set({
            totalOrders: sql`${customerTable.totalOrders} + 1`,
          })
          .where(eq(customerTable.id, customerId));
      }
  
      // Calculate the total amount for the order and validate product stock
      let totalAmount = 0;
      for (const product of products) {
        const [productData] = await db
          .select()
          .from(productTable)
          .where(eq(productTable.id, product.productId));
  
        if (!productData) {
          return new Response(
            JSON.stringify({
              error: `Product with ID ${product.productId} not found`,
            }),
            {
              status: 404,
            }
          );
        }
  
        // Check if there is enough stock
        if (productData.stockAvailability < product.quantity) {
          return new Response(
            JSON.stringify({
              error: `Insufficient stock for product ${product.productId}`,
            }),
            {
              status: 400,
            }
          );
        }
  
        totalAmount += productData.unitPrice * product.quantity;
      }
  
      // Create the order
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
          orderDate: new Date(),
        })
        .returning();
  
      // Add order products and deduct stock
      for (const product of products) {
        const [productData] = await db
          .select()
          .from(productTable)
          .where(eq(productTable.id, product.productId));
  
        await db.insert(orderProductTable).values({
          orderId: newOrder.id,
          productId: product.productId,
          quantity: product.quantity,
          unitPrice: productData.unitPrice,
          amount: productData.unitPrice * product.quantity,
        });
  
        // Deduct the stock from the product table
        await db
          .update(productTable)
          .set({
            stockAvailability: productData.stockAvailability - product.quantity,
          })
          .where(eq(productTable.id, product.productId));
      }
  
      return new Response(
        JSON.stringify({
          message: "Order created successfully",
          order: newOrder,
        }),
        {
          status: 201,
        }
      );
    } catch (error) {
      console.error("Error creating order:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
      });
    }
  }