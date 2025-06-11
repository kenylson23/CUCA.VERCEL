import { supabaseHelpers } from './supabase';

export interface GalleryPhoto {
  id: number;
  name: string;
  imageData: string;
  caption: string;
  status: string;
  approvedBy?: string;
  approvedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
  userId?: number;
}

// Detect if we should use Supabase (Vercel deployment) or local API (development)
const useSupabase = () => {
  const shouldUse = typeof window !== 'undefined' && 
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    (window.location.hostname.includes('.vercel.app') || 
     window.location.hostname.includes('replit.app') ||
     import.meta.env.PROD);
  
  console.log('Gallery Service - Environment Check:', {
    hasWindow: typeof window !== 'undefined',
    hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
    hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'undefined',
    isProd: import.meta.env.PROD,
    shouldUseSupabase: shouldUse
  });
  
  return shouldUse;
};

// Helper function to make API requests with proper error handling
async function makeLocalRequest(url: string, options?: RequestInit): Promise<any> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  
  return response.json();
}

// Convert Supabase data format to our GalleryPhoto format
function convertSupabaseToGalleryPhoto(supabasePhoto: any): GalleryPhoto {
  return {
    id: supabasePhoto.id,
    name: supabasePhoto.name,
    imageData: supabasePhoto.image_data,
    caption: supabasePhoto.caption || '',
    status: supabasePhoto.status,
    approvedBy: supabasePhoto.approved_by,
    approvedAt: supabasePhoto.approved_at,
    createdAt: supabasePhoto.created_at,
    updatedAt: supabasePhoto.updated_at,
    userId: supabasePhoto.user_id
  };
}

export const galleryService = {
  // Get approved photos for public gallery
  async getApprovedPhotos(): Promise<GalleryPhoto[]> {
    console.log('getApprovedPhotos called');
    if (useSupabase()) {
      try {
        console.log('Using Supabase for getApprovedPhotos');
        const photos = await supabaseHelpers.getFanPhotos();
        return photos.map(convertSupabaseToGalleryPhoto);
      } catch (error) {
        console.warn('Supabase error, falling back to local API:', error);
      }
    }
    console.log('Using local API for getApprovedPhotos');
    return makeLocalRequest('/api/fan-gallery');
  },

  // Get all photos (admin only)
  async getAllPhotos(): Promise<GalleryPhoto[]> {
    if (useSupabase()) {
      try {
        const photos = await supabaseHelpers.getAllFanPhotos();
        return photos.map(convertSupabaseToGalleryPhoto);
      } catch (error) {
        console.warn('Supabase error, falling back to local API:', error);
      }
    }
    return makeLocalRequest('/api/admin/fan-gallery');
  },

  // Get pending photos (admin only)
  async getPendingPhotos(): Promise<GalleryPhoto[]> {
    if (useSupabase()) {
      try {
        const photos = await supabaseHelpers.getPendingFanPhotos();
        return photos.map(convertSupabaseToGalleryPhoto);
      } catch (error) {
        console.warn('Supabase error, falling back to local API:', error);
      }
    }
    return makeLocalRequest('/api/admin/fan-gallery/pending');
  },

  // Approve photo
  async approvePhoto(id: number): Promise<void> {
    if (useSupabase()) {
      try {
        await supabaseHelpers.approveFanPhoto(id);
        return;
      } catch (error) {
        console.warn('Supabase error, falling back to local API:', error);
      }
    }
    await makeLocalRequest(`/api/admin/fan-gallery/${id}/approve`, {
      method: 'PATCH',
    });
  },

  // Reject photo
  async rejectPhoto(id: number): Promise<void> {
    if (useSupabase()) {
      try {
        await supabaseHelpers.rejectFanPhoto(id);
        return;
      } catch (error) {
        console.warn('Supabase error, falling back to local API:', error);
      }
    }
    await makeLocalRequest(`/api/admin/fan-gallery/${id}/reject`, {
      method: 'PATCH',
    });
  },

  // Delete photo
  async deletePhoto(id: number): Promise<void> {
    if (useSupabase()) {
      try {
        await supabaseHelpers.deleteFanPhoto(id);
        return;
      } catch (error) {
        console.warn('Supabase error, falling back to local API:', error);
      }
    }
    await makeLocalRequest(`/api/admin/fan-gallery/${id}`, {
      method: 'DELETE',
    });
  },

  // Submit new photo
  async submitPhoto(photo: {
    name: string;
    imageData: string;
    caption: string;
  }): Promise<void> {
    if (useSupabase()) {
      try {
        await supabaseHelpers.submitFanPhoto({
          name: photo.name,
          image_data: photo.imageData,
          caption: photo.caption
        });
        return;
      } catch (error) {
        console.warn('Supabase error, falling back to local API:', error);
      }
    }
    await makeLocalRequest('/api/fan-gallery', {
      method: 'POST',
      body: JSON.stringify(photo),
    });
  },
};