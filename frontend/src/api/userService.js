import client from './client';

export const userService = {
  getAll: async (search = '') => {
    const params = search ? { search } : {};
    const response = await client.get('/users', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await client.get(`/users/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await client.post('/users/add', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await client.put(`/users/edit/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await client.delete(`/users/delete/${id}`);
    return response.data;
  }
};