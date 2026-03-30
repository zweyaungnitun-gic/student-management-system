import client from './client';

export const teacherService = {
  getAll: async (search = '') => {
    const response = await client.get(`/teachers/?search=${search}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await client.get(`/teachers/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await client.post('/teachers/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await client.put(`/teachers/${id}`, data);
    return response.data;
  },

  activate: async (id) => {
    const response = await client.patch(`/teachers/${id}/activate`);
    return response.data;
  },

  deactivate: async (id) => {
    const response = await client.patch(`/teachers/${id}/deactivate`);
    return response.data;
  }
};
