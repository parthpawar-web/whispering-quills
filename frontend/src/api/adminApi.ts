import axiosInstance from './axiosInstance';

export const adminApi = {
  getStats: async () => {
    const response = await axiosInstance.get('/admin/stats');
    return response.data;
  },

  getUsers: async () => {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  },

  getStories: async () => {
    const response = await axiosInstance.get('/admin/stories');
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await axiosInstance.delete(`/admin/users/${id}`);
    return response.data;
  },

  deleteStory: async (id: string) => {
    const response = await axiosInstance.delete(`/admin/stories/${id}`);
    return response.data;
  },
};
