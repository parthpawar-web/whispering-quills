import axiosInstance from './axiosInstance';

export const storyApi = {
  getStories: async (category?: string, search?: string) => {
    let url = '/stories?';
    if (category && category !== 'All') {
      url += `category=${encodeURIComponent(category)}&`;
    }
    if (search) {
      url += `search=${encodeURIComponent(search)}&`;
    }
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getStoryById: async (id: string) => {
    const response = await axiosInstance.get(`/stories/${id}`);
    return response.data;
  },

  createStory: async (storyData: any) => {
    const response = await axiosInstance.post('/stories', storyData);
    return response.data;
  },

  updateStory: async (id: string, storyData: any) => {
    const response = await axiosInstance.put(`/stories/${id}`, storyData);
    return response.data;
  },

  deleteStory: async (id: string) => {
    const response = await axiosInstance.delete(`/stories/${id}`);
    return response.data;
  },

  likeStory: async (id: string) => {
    const response = await axiosInstance.put(`/stories/${id}/like`);
    return response.data;
  },

  addComment: async (id: string, text: string) => {
    const response = await axiosInstance.post(`/stories/${id}/comment`, { text });
    return response.data;
  },

  getMyStories: async () => {
    const response = await axiosInstance.get('/stories/my-stories');
    return response.data;
  },
};
