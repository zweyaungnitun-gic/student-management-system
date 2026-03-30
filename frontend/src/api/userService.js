import client from './client';

export const userService = {
  getAll: async (search = '') => {
    const response = await client.get(`/users/?search=${search}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await client.get(`/users/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await client.post('/users/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await client.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await client.delete(`/users/${id}`);
    return response.data;
  }
};
