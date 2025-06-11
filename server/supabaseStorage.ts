import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

// Create Supabase client with service role key for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface UploadResult {
  imageUrl: string;
  storageKey: string;
}

export async function uploadImageToSupabase(
  base64Data: string,
  filename?: string
): Promise<UploadResult> {
  try {
    // Convert base64 to buffer
    const base64WithoutPrefix = base64Data.split(',')[1];
    const buffer = Buffer.from(base64WithoutPrefix, 'base64');

    // Generate unique filename if not provided
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const finalFilename = filename || `fan-photos/${timestamp}-${randomId}.jpg`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('fan-gallery')
      .upload(finalFilename, buffer, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('fan-gallery')
      .getPublicUrl(finalFilename);

    return {
      imageUrl: publicUrl,
      storageKey: finalFilename
    };
  } catch (error) {
    console.error('Error uploading to Supabase Storage:', error);
    throw error;
  }
}

export async function deleteImageFromSupabase(storageKey: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin.storage
      .from('fan-gallery')
      .remove([storageKey]);

    if (error) {
      console.error('Supabase Storage delete error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting from Supabase Storage:', error);
    throw error;
  }
}

export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.SUPABASE_URL && 
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_URL !== 'https://your-project.supabase.co' &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your-service-role-key'
  );
}