import { api } from './api';

export const feedService = {
  getFeed: async (params) => {
    const response = await api.get('/Feed', { params });
    return response.data;
  }
};
