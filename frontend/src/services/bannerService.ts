import { config } from '../config/api';

const API_URL = config.endpoints.banners;

const getAuthHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const bannerService = {
  // Get all active banners
  getAllBanners: async () => {
    const response = await fetch(API_URL, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch banners');
    return response.json();
  },

  // Get currently running banners
  getCurrentBanners: async () => {
    const response = await fetch(`${API_URL}/current`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch current banners');
    return response.json();
  },

  // Get upcoming banners
  getUpcomingBanners: async () => {
    const response = await fetch(`${API_URL}/upcoming`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch upcoming banners');
    return response.json();
  },

  // Get past banners (history)
  getPastBanners: async () => {
    const response = await fetch(`${API_URL}/history`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch banner history');
    return response.json();
  },

  // Get banner by ID
  getBannerById: async (id: number) => {
    const response = await fetch(`${API_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch banner');
    return response.json();
  },

  // Create new banner (admin)
  createBanner: async (data: {
    name: string;
    startDate: string;
    endDate: string;
    featured5StarCharacterId: number;
    featured4StarCharacter1Id: number;
    featured4StarCharacter2Id: number;
    featured4StarCharacter3Id: number;
  }) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create banner');
    }
    return response.json();
  },

  // Update banner (admin)
  updateBanner: async (id: number, data: {
    name: string;
    startDate: string;
    endDate: string;
    featured5StarCharacterId: number;
    featured4StarCharacter1Id: number;
    featured4StarCharacter2Id: number;
    featured4StarCharacter3Id: number;
  }) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to update banner');
    }
    return response.json();
  },

  // Delete banner (admin)
  deleteBanner: async (id: number) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete banner');
    return response.text();
  },
};
