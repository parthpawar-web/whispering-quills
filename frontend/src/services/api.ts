// src/services/api.ts

let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
if (!baseUrl.endsWith('/api')) {
  baseUrl = `${baseUrl.replace(/\/$/, '')}/api`;
}
const API_BASE_URL = baseUrl;

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Something went wrong');
  }

  return data;
};

export const api = {
  // Auth
  login: (data: any) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => fetchApi('/auth/profile'),
  
  // Stories
  getStories: (category?: string, search?: string, featured?: boolean) => {
    let url = '/stories?';
    if (category && category !== 'All') url += `category=${encodeURIComponent(category)}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (featured) url += `featured=true&`;
    return fetchApi(url);
  },
  getStoryById: (id: string) => fetchApi(`/stories/${id}`),
  createStory: (data: any) => fetchApi('/stories', { method: 'POST', body: JSON.stringify(data) }),
  updateStory: (id: string, data: any) => fetchApi(`/stories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStory: (id: string) => fetchApi(`/stories/${id}`, { method: 'DELETE' }),
  likeStory: (id: string) => fetchApi(`/stories/${id}/like`, { method: 'PUT' }),
  addComment: (id: string, text: string) => fetchApi(`/stories/${id}/comment`, { method: 'POST', body: JSON.stringify({ text }) }),
  getMyStories: () => fetchApi('/stories/my-stories'),
  
  // Users
  getAuthors: () => fetchApi('/users/authors'),
  toggleSaveStory: (storyId: string) => fetchApi(`/users/save-story/${storyId}`, { method: 'PUT' }),
  getSavedStories: () => fetchApi('/users/saved-stories'),
  
  // Admin
  getAdminStats: () => fetchApi('/admin/stats'),
  getAdminUsers: () => fetchApi('/admin/users'),
};
