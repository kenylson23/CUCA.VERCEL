// Gallery service for fan photo management
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

export const galleryService = {
  // Get approved photos for public gallery
  async getApprovedPhotos(): Promise<GalleryPhoto[]> {
    return makeLocalRequest('/api/fan-gallery');
  },

  // Get all photos (admin only)
  async getAllPhotos(): Promise<GalleryPhoto[]> {
    return makeLocalRequest('/api/admin/fan-gallery');
  },

  // Get pending photos (admin only)
  async getPendingPhotos(): Promise<GalleryPhoto[]> {
    return makeLocalRequest('/api/admin/fan-gallery/pending');
  },

  // Approve photo
  async approvePhoto(id: number): Promise<void> {
    await makeLocalRequest(`/api/admin/fan-gallery/${id}/approve`, {
      method: 'PATCH',
    });
  },

  // Reject photo
  async rejectPhoto(id: number): Promise<void> {
    await makeLocalRequest(`/api/admin/fan-gallery/${id}/reject`, {
      method: 'PATCH',
    });
  },

  // Delete photo
  async deletePhoto(id: number): Promise<void> {
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
    await makeLocalRequest('/api/fan-gallery', {
      method: 'POST',
      body: JSON.stringify(photo),
    });
  },
};