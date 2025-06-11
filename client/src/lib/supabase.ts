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

  // Fan Photos
  async getFanPhotos() {
    const { data, error } = await supabase
      .from('fan_photos')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
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