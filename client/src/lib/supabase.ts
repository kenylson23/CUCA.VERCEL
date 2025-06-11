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

  // Fan Photos - submit new photo
  async submitFanPhoto(photo: {
    name: string;
    image_data: string;
    caption: string;
  }) {
    const { data, error } = await supabase
      .from('fan_photos')
      .insert([{
        name: photo.name,
        image_data: photo.image_data,
        caption: photo.caption,
        status: 'pending'
      }])
      .select()
    
    if (error) throw error
    return data[0]
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
    const { error } = await supabase
      .from('fan_photos')
      .delete()
      .eq('id', id)
    
    if (error) throw error
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