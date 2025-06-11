import {
  pgTable,
  text,
  varchar,
  timestamp,
  serial,
  boolean,
  decimal,
  jsonb,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for authentication
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Admin users table for authentication
export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("admin"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Customer users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: varchar("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  phone: varchar("phone"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price").notNull(),
  category: varchar("category"),
  stockQuantity: decimal("stock_quantity").notNull().default("0"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  slug: varchar("slug").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  status: varchar("status").notNull().default("pending"),
  totalAmount: decimal("total_amount").notNull(),
  shippingAddress: text("shipping_address"),
  paymentMethod: varchar("payment_method"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price").notNull(),
});

// Contact messages table
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  subject: varchar("subject"),
  message: text("message").notNull(),
  phone: varchar("phone"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Analytics events table
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  eventType: varchar("event_type").notNull(),
  eventData: jsonb("event_data"),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Fan photos table
export const fanPhotos = pgTable("fan_photos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  status: varchar("status").notNull().default("pending"),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  fanPhotos: many(fanPhotos),
  analyticsEvents: many(analyticsEvents),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
}));

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  user: one(users, {
    fields: [analyticsEvents.userId],
    references: [users.id],
  }),
}));

export const fanPhotosRelations = relations(fanPhotos, ({ one }) => ({
  user: one(users, {
    fields: [fanPhotos.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  phone: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).pick({
  name: true,
  email: true,
  subject: true,
  message: true,
  phone: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  category: true,
  stockQuantity: true,
  imageUrl: true,
  slug: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  totalAmount: true,
  shippingAddress: true,
  paymentMethod: true,
  notes: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  quantity: true,
  price: true,
});

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).pick({
  userId: true,
  eventType: true,
  eventData: true,
  userAgent: true,
  ipAddress: true,
});

export const insertFanPhotoSchema = createInsertSchema(fanPhotos).pick({
  userId: true,
  imageUrl: true,
  caption: true,
});

export const upsertAdminUserSchema = createInsertSchema(adminUsers);

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpsertAdminUser = z.infer<typeof upsertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertFanPhoto = z.infer<typeof insertFanPhotoSchema>;
export type FanPhoto = typeof fanPhotos.$inferSelect;