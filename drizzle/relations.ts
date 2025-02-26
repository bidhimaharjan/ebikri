import { relations } from "drizzle-orm/relations";
import { business, customer, order, orderproduct, product, users } from "./schema";

export const customerRelations = relations(customer, ({one, many}) => ({
	business: one(business, {
		fields: [customer.businessId],
		references: [business.id]
	}),
	orders: many(order),
}));

export const businessRelations = relations(business, ({one, many}) => ({
	customers: many(customer),
	products: many(product),
	orders: many(order),
	user: one(users, {
		fields: [business.userId],
		references: [users.id]
	}),
}));

export const orderproductRelations = relations(orderproduct, ({one}) => ({
	order: one(order, {
		fields: [orderproduct.orderId],
		references: [order.id]
	}),
	product: one(product, {
		fields: [orderproduct.productId],
		references: [product.id]
	}),
}));

export const orderRelations = relations(order, ({one, many}) => ({
	orderproducts: many(orderproduct),
	business: one(business, {
		fields: [order.businessId],
		references: [business.id]
	}),
	customer: one(customer, {
		fields: [order.customerId],
		references: [customer.id]
	}),
}));

export const productRelations = relations(product, ({one, many}) => ({
	orderproducts: many(orderproduct),
	business: one(business, {
		fields: [product.businessId],
		references: [business.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	businesses: many(business),
}));