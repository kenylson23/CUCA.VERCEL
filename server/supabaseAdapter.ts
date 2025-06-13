import { createClient } from '@supabase/supabase-js';
import type { IStorage } from './storage';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role key for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export class SupabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<AdminUser | undefined> {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async upsertUser(user: UpsertAdminUser): Promise<AdminUser> {
    const { data, error } = await supabase
      .from('admin_users')
      .upsert(user)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Customer operations
  async getCustomer(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async getCustomerByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async createCustomer(user: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getCustomers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async updateCustomer(id: number, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteProduct(id: number): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Order items operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    
    if (error) throw error;
    return data || [];
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const { data, error } = await supabase
      .from('order_items')
      .insert(orderItem)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Contact messages operations
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert(message)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async updateContactMessage(id: number, updates: Partial<ContactMessage>): Promise<ContactMessage> {
    const { data, error } = await supabase
      .from('contact_messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Analytics operations
  async createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const { data, error } = await supabase
      .from('analytics_events')
      .insert(event)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getAnalyticsEvents(limit: number = 100): Promise<AnalyticsEvent[]> {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  // Fan Photos operations
  async createFanPhoto(photo: InsertFanPhoto & { userId?: number }): Promise<FanPhoto> {
    const { data, error } = await supabase
      .from('fan_photos')
      .insert(photo)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getFanPhotos(): Promise<FanPhoto[]> {
    const { data, error } = await supabase
      .from('fan_photos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getPendingFanPhotos(): Promise<FanPhoto[]> {
    const { data, error } = await supabase
      .from('fan_photos')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getFanPhoto(id: number): Promise<FanPhoto | undefined> {
    const { data, error } = await supabase
      .from('fan_photos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async getApprovedFanPhotos(): Promise<FanPhoto[]> {
    const { data, error } = await supabase
      .from('fan_photos')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async updateFanPhotoStatus(id: number, status: string, approvedBy?: string): Promise<FanPhoto> {
    const updateData: any = { status };
    if (approvedBy) {
      updateData.approved_by = approvedBy;
      updateData.approved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('fan_photos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserPhotos(userId: number): Promise<FanPhoto[]> {
    const { data, error } = await supabase
      .from('fan_photos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async deleteFanPhoto(id: number): Promise<void> {
    const { error } = await supabase
      .from('fan_photos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}

export function isSupabaseConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}