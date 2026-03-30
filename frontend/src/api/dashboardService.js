import client from './client';

export const dashboardService = {
  getStats: async () => {
    const response = await client.get('/dashboard/');
    return response.data;
  }
};
