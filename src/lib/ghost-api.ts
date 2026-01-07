/**
 * GHOST Marketing Bot API Service
 * Handles all API calls to GHOST backend endpoints
 */

import { BACKEND_URL } from './config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Types
export interface BrandKit {
  id: string;
  name: string;
  logo: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
  brandVoice: 'friendly' | 'professional' | 'playful' | 'luxurious';
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  brandId: string;
  filename: string;
  cloudinaryUrl: string;
  width: number;
  height: number;
  format: string;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'event' | 'promotion' | 'announcement' | 'custom';
  status: 'active' | 'inactive' | 'archived';
  captionTemplate: string;
  hashtags: string[];
  brandVoice: 'friendly' | 'professional' | 'playful' | 'luxurious';
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledPost {
  id: string;
  templateId?: string;
  assetId: string;
  brandKitId: string;
  scheduledFor: string;
  status: 'scheduled' | 'published' | 'failed' | 'cancelled';
  captionText: string;
  hashtags: string[];
  composedImageUrl?: string;
  publishedAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Caption {
  text: string;
  hashtags: string[];
  cta?: string;
}

// Brand Kit API
export const brandKitAPI = {
  create: async (data: {
    name: string;
    logo: string;
    colors: { primary: string; secondary: string; accent: string };
    fonts: { primary: string; secondary: string };
    brandVoice: string;
  }): Promise<BrandKit> => {
    const response = await fetch(`${BACKEND_URL}/api/ghost/brands/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create brand kit');
    return response.json();
  },

  get: async (id: string): Promise<BrandKit> => {
    const response = await fetch(`${BACKEND_URL}/api/ghost/brands/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch brand kit');
    return response.json();
  },

  update: async (id: string, data: Partial<BrandKit>): Promise<BrandKit> => {
    const response = await fetch(`${BACKEND_URL}/api/ghost/brands/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update brand kit');
    return response.json();
  },
};

// Assets API
export const assetsAPI = {
  upload: async (file: File, brandId: string): Promise<Asset> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('brandId', brandId);

    const token = localStorage.getItem('token');
    const response = await fetch(`${BACKEND_URL}/api/ghost/assets/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload asset');
    return response.json();
  },

  list: async (brandId: string): Promise<Asset[]> => {
    const response = await fetch(`${BACKEND_URL}/api/ghost/assets?brandId=${brandId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch assets');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${BACKEND_URL}/api/ghost/assets/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete asset');
  },
};

// Templates API
export const templatesAPI = {
  create: async (data: {
    name: string;
    type: Template['type'];
    captionTemplate: string;
    brandVoice: Template['brandVoice'];
    hashtags: string[];
    metadata?: Record<string, any>;
  }): Promise<Template> => {
    const response = await fetch(`${BACKEND_URL}/api/ghost/templates`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create template');
    return response.json();
  },

  list: async (filters?: { type?: string; status?: string }): Promise<Template[]> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    
    const response = await fetch(`${BACKEND_URL}/api/ghost/templates?${params}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch templates');
    return response.json();
  },

  update: async (id: string, data: Partial<Template>): Promise<Template> => {
    const response = await fetch(`${BACKEND_URL}/api/ghost/templates/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update template');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${BACKEND_URL}/api/ghost/templates/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete template');
  },
};

// Scheduled Posts API
export const scheduledPostsAPI = {
  schedule: async (data: {
    assetId: string;
    brandKitId: string;
    scheduledFor: string;
    captionText: string;
    hashtags: string[];
    templateId?: string;
  }): Promise<ScheduledPost> => {
    const response = await fetch(`${BACKEND_URL}/api/ghost/schedule`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to schedule post');
    return response.json();
  },

  list: async (filters?: {
    status?: string;
    from?: string;
    to?: string;
  }): Promise<ScheduledPost[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    
    const response = await fetch(`${BACKEND_URL}/api/ghost/schedule?${params}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch scheduled posts');
    return response.json();
  },

  cancel: async (id: string): Promise<void> => {
    const response = await fetch(`${BACKEND_URL}/api/ghost/schedule/${id}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to cancel post');
  },

  reschedule: async (id: string, newDate: string): Promise<ScheduledPost> => {
    const response = await fetch(`${BACKEND_URL}/api/ghost/schedule/${id}/reschedule`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ scheduledFor: newDate }),
    });
    if (!response.ok) throw new Error('Failed to reschedule post');
    return response.json();
  },
};

// AI Caption Generation API
export const captionAPI = {
  generate: async (data: {
    assetName: string;
    brandName: string;
    brandVoice: string;
    captionType: 'promotion' | 'event' | 'announcement' | 'product';
    tags?: string[];
    targetAudience?: string;
    callToAction?: string;
  }): Promise<{
    success: boolean;
    caption?: Caption;
    provider?: string;
    generationTime?: number;
    error?: string;
  }> => {
    const response = await fetch(`${BACKEND_URL}/api/ghost/generate-caption`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to generate caption');
    return response.json();
  },
};

// Image Composition API
export const compositionAPI = {
  compose: async (data: {
    assetId: string;
    brandKitId: string;
    options?: {
      overlay?: { text: string; position: string };
      filters?: { brightness?: number; contrast?: number; saturation?: number };
    };
  }): Promise<{
    composedImageUrl: string;
    composition: any;
  }> => {
    const response = await fetch(`${BACKEND_URL}/api/ghost/compose`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to compose image');
    return response.json();
  },
};
