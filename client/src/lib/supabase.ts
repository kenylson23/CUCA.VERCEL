import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  }
})

// Helper functions for common database operations
export const supabaseHelpers = {
  // Products
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Fan Photos - get approved photos only
  async getFanPhotos() {
    const { data, error } = await supabase
      .from('fan_photos')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Fan Photos - get all photos (admin)
  async getAllFanPhotos() {
    const { data, error } = await supabase
      .from('fan_photos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Fan Photos - get pending photos (admin)
  async getPendingFanPhotos() {
    const { data, error } = await supabase
      .from('fan_photos')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Fan Photos - submit new photo with Storage upload
  async submitFanPhoto(photo: {
    name: string;
    image_data: string;
    caption: string;
  }) {
    try {
      // Convert base64 to blob for upload
      const base64Data = photo.image_data.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const filename = `fan-photos/${timestamp}-${randomId}.jpg`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('fan-gallery')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('fan-gallery')
        .getPublicUrl(filename);

      // Insert photo record with storage info
      const { data, error } = await supabase
        .from('fan_photos')
        .insert([{
          name: photo.name,
          image_data: photo.image_data, // Manter para compatibilidade
          image_url: publicUrl,
          storage_key: filename,
          caption: photo.caption,
          status: 'pending'
        }])
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error submitting fan photo:', error);
      throw error;
    }
  },

  // Fan Photos - approve photo
  async approveFanPhoto(id: number) {
    const { data, error } = await supabase
      .from('fan_photos')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: 'admin'
      })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Fan Photos - reject photo
  async rejectFanPhoto(id: number) {
    const { data, error } = await supabase
      .from('fan_photos')
      .update({
        status: 'rejected',
        approved_by: 'admin'
      })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Fan Photos - delete photo
  async deleteFanPhoto(id: number) {
    try {
      // First get the photo to retrieve storage key
      const { data: photo, error: fetchError } = await supabase
        .from('fan_photos')
        .select('storage_key')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage if storage key exists
      if (photo?.storage_key) {
        const { error: storageError } = await supabase.storage
          .from('fan-gallery')
          .remove([photo.storage_key]);
        
        if (storageError) {
          console.warn('Failed to delete image from storage:', storageError);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('fan_photos')
        .delete()
        .eq('id', id);
    
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting fan photo:', error);
      throw error;
    }
  },

  // Contact Messages
  async submitContactMessage(message: {
    name: string
    email: string
    subject?: string
    message: string
    phone?: string
  }) {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([message])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Analytics
  async trackEvent(eventType: string, eventData: any = {}) {
    const { error } = await supabase
      .from('analytics_events')
      .insert([{
        event_type: eventType,
        event_data: eventData,
        user_agent: navigator.userAgent,
        ip_address: null // Will be populated by RLS if needed
      }])
    
    if (error) console.warn('Analytics tracking failed:', error)
  }
}