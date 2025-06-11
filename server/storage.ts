import {
  users,
  contactMessages,
  products,
  orders,
  orderItems,
  analyticsEvents,
  adminUsers,
  fanPhotos,
  type User,
  type InsertUser,
  type UpsertAdminUser,
  type AdminUser,
  type ContactMessage,
  type InsertContactMessage,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type AnalyticsEvent,
  type InsertAnalyticsEvent,
  type FanPhoto,
  type InsertFanPhoto,
} from "../shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<AdminUser | undefined>;
  upsertUser(user: UpsertAdminUser): Promise<AdminUser>;
  
  // Customer operations
  getCustomer(id: number): Promise<User | undefined>;
  getCustomerByUsername(username: string): Promise<User | undefined>;
  createCustomer(user: InsertUser): Promise<User>;
  getCustomers(): Promise<User[]>;
  updateCustomer(id: number, updates: Partial<User>): Promise<User>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<Product>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  
  // Order operations
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  
  // Order items operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Contact messages operations
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
  updateContactMessage(id: number, updates: Partial<ContactMessage>): Promise<ContactMessage>;
  
  // Analytics operations
  createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getAnalyticsEvents(limit?: number): Promise<AnalyticsEvent[]>;
  
  // Fan Photos operations
  createFanPhoto(photo: InsertFanPhoto): Promise<FanPhoto>;
  getFanPhoto(id: number): Promise<FanPhoto | undefined>;
  getFanPhotos(): Promise<FanPhoto[]>;
  getPendingFanPhotos(): Promise<FanPhoto[]>;
  getApprovedFanPhotos(): Promise<FanPhoto[]>;
  getUserPhotos(userId: number): Promise<FanPhoto[]>;
  updateFanPhotoStatus(id: number, status: string, approvedBy?: string): Promise<FanPhoto>;
  deleteFanPhoto(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Admin user operations (for Replit Auth)
  async getUser(id: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertAdminUser): Promise<AdminUser> {
    const [user] = await db
      .insert(adminUsers)
      .values(userData)
      .onConflictDoUpdate({
        target: adminUsers.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Customer operations
  async getCustomer(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getCustomerByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createCustomer(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCustomers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateCustomer(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Order items operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db
      .insert(orderItems)
      .values(insertOrderItem)
      .returning();
    return orderItem;
  }

  // Contact messages operations
  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const [message] = await db
      .insert(contactMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async updateContactMessage(id: number, updates: Partial<ContactMessage>): Promise<ContactMessage> {
    const [message] = await db
      .update(contactMessages)
      .set(updates)
      .where(eq(contactMessages.id, id))
      .returning();
    return message;
  }

  // Analytics operations
  async createAnalyticsEvent(insertEvent: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const [event] = await db
      .insert(analyticsEvents)
      .values(insertEvent)
      .returning();
    return event;
  }

  async getAnalyticsEvents(limit: number = 100): Promise<AnalyticsEvent[]> {
    return await db.select().from(analyticsEvents)
      .orderBy(desc(analyticsEvents.createdAt))
      .limit(limit);
  }

  // Fan Photos operations
  async createFanPhoto(insertPhoto: InsertFanPhoto & { userId?: number }): Promise<FanPhoto> {
    const [photo] = await db
      .insert(fanPhotos)
      .values(insertPhoto)
      .returning();
    return photo;
  }

  async getFanPhotos(): Promise<FanPhoto[]> {
    return await db
      .select()
      .from(fanPhotos)
      .orderBy(desc(fanPhotos.createdAt));
  }

  async getPendingFanPhotos(): Promise<FanPhoto[]> {
    return await db
      .select()
      .from(fanPhotos)
      .where(eq(fanPhotos.status, "pending"))
      .orderBy(desc(fanPhotos.createdAt));
  }

  async getFanPhoto(id: number): Promise<FanPhoto | undefined> {
    const [photo] = await db
      .select()
      .from(fanPhotos)
      .where(eq(fanPhotos.id, id))
      .limit(1);
    return photo;
  }

  async getApprovedFanPhotos(): Promise<FanPhoto[]> {
    return await db
      .select()
      .from(fanPhotos)
      .where(eq(fanPhotos.status, "approved"))
      .orderBy(desc(fanPhotos.approvedAt));
  }

  async updateFanPhotoStatus(id: number, status: string, approvedBy?: string): Promise<FanPhoto> {
    const updateData: any = { 
      status,
      approvedAt: status === "approved" ? new Date() : null
    };
    
    if (approvedBy) {
      updateData.approvedBy = approvedBy;
    }

    const [photo] = await db
      .update(fanPhotos)
      .set(updateData)
      .where(eq(fanPhotos.id, id))
      .returning();
    return photo;
  }

  async getUserPhotos(userId: number): Promise<FanPhoto[]> {
    const photos = await db
      .select()
      .from(fanPhotos)
      .where(eq(fanPhotos.userId, userId))
      .orderBy(desc(fanPhotos.createdAt));
    return photos;
  }

  async deleteFanPhoto(id: number): Promise<void> {
    await db
      .delete(fanPhotos)
      .where(eq(fanPhotos.id, id));
  }
}

export const storage = new DatabaseStorage();
