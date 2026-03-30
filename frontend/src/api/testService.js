import client from './client';

export const testService = {
  getAll: async (courseId = '') => {
    const url = courseId ? `/tests/?course_id=${courseId}` : '/tests/';
    const response = await client.get(url);
    return response.data;
  },

  getById: async (id) => {
    const response = await client.get(`/tests/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await client.post('/tests/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await client.put(`/tests/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await client.delete(`/tests/${id}`);
    return response.data;
  }
};
