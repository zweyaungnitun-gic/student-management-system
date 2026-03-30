import client from './client';

export const studentService = {
  getAll: async (skip = 0, limit = 100) => {
    const response = await client.get(`/students/?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await client.get(`/students/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await client.post('/students/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await client.put(`/students/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await client.delete(`/students/${id}`);
    return response.data;
  }
};
