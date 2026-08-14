import { api } from './api';

export const routeService = {
  planRoute: async (routeData) => {
    const response = await api.post('/Route/plan', routeData);
    return response.data;
  },
  getRoute: async (id) => {
    const response = await api.get(`/Route/${id}`);
    return response.data;
  },
  addStop: async (routeId, stopData) => {
    const response = await api.post(`/Route/${routeId}/stops`, stopData);
    return response.data;
  }
};
