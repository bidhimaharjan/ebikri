import { pgTable, foreignKey, unique, integer, varchar, date, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const customer = pgTable("customer", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "customer_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	businessId: integer().notNull(),
	name: varchar({ length: 255 }).notNull(),
	phoneNumber: varchar({ length: 10 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	addedDate: date("added_date").notNull(),
	totalOrders: integer().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [business.id],
			name: "customer_businessId_business_id_fk"
		}).onDelete("cascade"),
	unique("customer_phoneNumber_unique").on(table.phoneNumber),
	unique("customer_email_unique").on(table.email),
]);

export const orderproduct = pgTable("orderproduct", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "orderproduct_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	orderId: integer().notNull(),
	productId: integer().notNull(),
	quantity: integer().notNull(),
	unitPrice: numeric().notNull(),
	amount: numeric().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [order.id],
			name: "orderproduct_orderId_order_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [product.id],
			name: "orderproduct_productId_product_id_fk"
		}).onDelete("cascade"),
]);

export const product = pgTable("product", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "product_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	businessId: integer().notNull(),
	productName: varchar({ length: 255 }).notNull(),
	stockAvailability: integer().notNull(),
	unitPrice: numeric().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [business.id],
			name: "product_businessId_business_id_fk"
		}).onDelete("cascade"),
]);

export const order = pgTable("order", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "order_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	businessId: integer().notNull(),
	customerName: varchar({ length: 255 }).notNull(),
	phoneNumber: varchar({ length: 10 }).notNull(),
	deliveryLocation: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	totalAmount: numeric().notNull(),
	orderDate: date("order_date").notNull(),
	customerId: integer().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [business.id],
			name: "order_businessId_business_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customer.id],
			name: "order_customerId_customer_id_fk"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "users_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	email: varchar({ length: 255 }).notNull(),
	phoneNumber: varchar({ length: 10 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
	unique("users_phoneNumber_unique").on(table.phoneNumber),
]);

export const business = pgTable("business", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "business_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: integer().notNull(),
	businessName: varchar({ length: 255 }).notNull(),
	businessType: varchar({ length: 255 }).notNull(),
	businessEmail: varchar({ length: 255 }),
	panNumber: varchar({ length: 12 }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "business_userId_users_id_fk"
		}).onDelete("cascade"),
	unique("business_businessEmail_unique").on(table.businessEmail),
	unique("business_panNumber_unique").on(table.panNumber),
]);
