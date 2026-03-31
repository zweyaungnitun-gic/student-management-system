import client from './client';

export const dashboardService = {
  getStats: async (config = {}) => {
    const response = await client.get('/dashboard/', config);
    return response.data;
  }
};
