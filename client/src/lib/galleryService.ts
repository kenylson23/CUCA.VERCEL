import { supabaseHelpers, supabase } from './supabase';
import { apiRequest } from './queryClient';

// Detect environment - use Supabase on Vercel, local API otherwise
const isVercelProduction = typeof window !== 'undefined' && 
  (window.location.hostname.includes('.vercel.app') || 
   import.meta.env.VITE_SUPABASE_URL);

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

export const galleryService = {
  // Get approved photos for public gallery
  async getApprovedPhotos(): Promise<GalleryPhoto[]> {
    if (isVercelProduction) {
      try {
        const photos = await supabaseHelpers.getFanPhotos();
        return photos.map(photo => ({
          id: photo.id,
          name: photo.name,
          imageData: photo.image_data,
          caption: photo.caption || '',
          status: photo.status,
          approvedBy: photo.approved_by,
          approvedAt: photo.approved_at,
          createdAt: photo.created_at,
          updatedAt: photo.updated_at
        }));
      } catch (error) {
        console.warn('Supabase fallback to local API for photos');
        return this.getApprovedPhotosLocal();
      }
    }
    return this.getApprovedPhotosLocal();
  },

  // Get all photos (admin only)
  async getAllPhotos(): Promise<GalleryPhoto[]> {
    if (isVercelProduction) {
      try {
        const { data, error } = await supabaseHelpers.supabase
          .from('fan_photos')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return data.map(photo => ({
          id: photo.id,
          name: photo.name,
          imageData: photo.image_data,
          caption: photo.caption || '',
          status: photo.status,
          approvedBy: photo.approved_by,
          approvedAt: photo.approved_at,
          createdAt: photo.created_at,
          updatedAt: photo.updated_at,
          userId: photo.user_id
        }));
      } catch (error) {
        console.warn('Supabase fallback to local API for all photos');
        return this.getAllPhotosLocal();
      }
    }
    return this.getAllPhotosLocal();
  },

  // Get pending photos (admin only)
  async getPendingPhotos(): Promise<GalleryPhoto[]> {
    if (isVercelProduction) {
      try {
        const { data, error } = await supabaseHelpers.supabase
          .from('fan_photos')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return data.map(photo => ({
          id: photo.id,
          name: photo.name,
          imageData: photo.image_data,
          caption: photo.caption || '',
          status: photo.status,
          approvedBy: photo.approved_by,
          approvedAt: photo.approved_at,
          createdAt: photo.created_at,
          updatedAt: photo.updated_at,
          userId: photo.user_id
        }));
      } catch (error) {
        console.warn('Supabase fallback to local API for pending photos');
        return this.getPendingPhotosLocal();
      }
    }
    return this.getPendingPhotosLocal();
  },

  // Approve photo
  async approvePhoto(id: number): Promise<void> {
    if (isVercelProduction) {
      try {
        const { error } = await supabaseHelpers.supabase
          .from('fan_photos')
          .update({
            status: 'approved',
            approved_at: new Date().toISOString(),
            approved_by: 'admin'
          })
          .eq('id', id);
        
        if (error) throw error;
        return;
      } catch (error) {
        console.warn('Supabase fallback to local API for approve');
        return this.approvePhotoLocal(id);
      }
    }
    return this.approvePhotoLocal(id);
  },

  // Reject photo
  async rejectPhoto(id: number): Promise<void> {
    if (isVercelProduction) {
      try {
        const { error } = await supabaseHelpers.supabase
          .from('fan_photos')
          .update({
            status: 'rejected',
            approved_by: 'admin'
          })
          .eq('id', id);
        
        if (error) throw error;
        return;
      } catch (error) {
        console.warn('Supabase fallback to local API for reject');
        return this.rejectPhotoLocal(id);
      }
    }
    return this.rejectPhotoLocal(id);
  },

  // Delete photo
  async deletePhoto(id: number): Promise<void> {
    if (isVercelProduction) {
      try {
        const { error } = await supabaseHelpers.supabase
          .from('fan_photos')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        return;
      } catch (error) {
        console.warn('Supabase fallback to local API for delete');
        return this.deletePhotoLocal(id);
      }
    }
    return this.deletePhotoLocal(id);
  },

  // Submit new photo
  async submitPhoto(photo: {
    name: string;
    imageData: string;
    caption: string;
  }): Promise<void> {
    if (isVercelProduction) {
      try {
        const { error } = await supabaseHelpers.supabase
          .from('fan_photos')
          .insert([{
            name: photo.name,
            image_data: photo.imageData,
            caption: photo.caption,
            status: 'pending'
          }]);
        
        if (error) throw error;
        return;
      } catch (error) {
        console.warn('Supabase fallback to local API for submit');
        return this.submitPhotoLocal(photo);
      }
    }
    return this.submitPhotoLocal(photo);
  },

  // Local API fallback methods
  async getApprovedPhotosLocal(): Promise<GalleryPhoto[]> {
    const response = await fetch('/api/fan-gallery');
    if (!response.ok) throw new Error('Failed to fetch photos');
    return response.json();
  },

  async getAllPhotosLocal(): Promise<GalleryPhoto[]> {
    return apiRequest('/api/admin/fan-gallery', 'GET');
  },

  async getPendingPhotosLocal(): Promise<GalleryPhoto[]> {
    return apiRequest('/api/admin/fan-gallery/pending', 'GET');
  },

  async approvePhotoLocal(id: number): Promise<void> {
    await apiRequest(`/api/admin/fan-gallery/${id}/approve`, 'PATCH');
  },

  async rejectPhotoLocal(id: number): Promise<void> {
    await apiRequest(`/api/admin/fan-gallery/${id}/reject`, 'PATCH');
  },

  async deletePhotoLocal(id: number): Promise<void> {
    await apiRequest(`/api/admin/fan-gallery/${id}`, 'DELETE');
  },

  async submitPhotoLocal(photo: {
    name: string;
    imageData: string;
    caption: string;
  }): Promise<void> {
    await apiRequest('/api/fan-gallery', 'POST', photo);
  }
};