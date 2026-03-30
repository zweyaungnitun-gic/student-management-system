import client from './client';

export const teacherService = {
  getAll: async (search = '') => {
    const params = search ? { search } : {};
    const response = await client.get('/teachers', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await client.get(`/teachers/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await client.post('/teachers/add', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await client.put(`/teachers/edit/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await client.delete(`/teachers/delete/${id}`);
    return response.data;
  },

  activate: async (id) => {
    const response = await client.post(`/teachers/activate/${id}`);
    return response.data;
  },

  deactivate: async (id) => {
    const response = await client.post(`/teachers/deactivate/${id}`);
    return response.data;
  }
};