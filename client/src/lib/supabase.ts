import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client if credentials are available
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false // We handle auth via Express session
    }
  })
  : null;

export interface UploadResult {
  imageUrl: string;
  storageKey: string;
}

export async function uploadImageToSupabase(file: File): Promise<UploadResult> {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const filename = `fan-photos/${timestamp}-${randomId}.${fileExtension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('fan-gallery')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('fan-gallery')
      .getPublicUrl(filename);

    return {
      imageUrl: publicUrl,
      storageKey: filename
    };
  } catch (error) {
    console.error('Error uploading to Supabase Storage:', error);
    throw error;
  }
}

export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

// Helper functions for direct Supabase operations
export const supabaseHelpers = {
  // Get products from Supabase
  async getProducts() {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get fan photos from Supabase
  async getFanPhotos() {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('fan_photos')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Submit contact message to Supabase
  async submitContactMessage(message: {
    name: string;
    email: string;
    subject?: string;
    message: string;
    phone?: string;
  }) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([{
        name: message.name,
        email: message.email,
        subject: message.subject || 'Contato do site',
        message: message.message,
        phone: message.phone,
        is_read: false,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Track analytics events
  async trackEvent(eventType: string, eventData: any = {}) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('analytics_events')
      .insert([{
        event_type: eventType,
        event_data: eventData,
        user_agent: navigator.userAgent,
        ip_address: null, // Will be set by server
        created_at: new Date().toISOString()
      }]);
    
    if (error) console.warn('Analytics tracking failed:', error);
    return data;
  }
};