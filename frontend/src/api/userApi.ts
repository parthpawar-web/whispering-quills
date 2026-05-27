import axiosInstance from './axiosInstance';

export const userApi = {
  getProfile: async () => {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
  },

  updateProfile: async (profileData: any) => {
    const response = await axiosInstance.put('/users/profile', profileData);
    return response.data;
  },

  getAuthors: async () => {
    const response = await axiosInstance.get('/users/authors');
    return response.data;
  },

  getUserStatsAndProfile: async (id: string) => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },

  getLikedStories: async () => {
    const response = await axiosInstance.get('/users/liked-stories');
    return response.data;
  },

  toggleSaveStory: async (storyId: string) => {
    const response = await axiosInstance.put(`/users/save-story/${storyId}`);
    return response.data;
  },

  getSavedStories: async () => {
    const response = await axiosInstance.get('/users/saved-stories');
    return response.data;
  },
};
