import client from './client';

export const registrationService = {
  submit: async (data) => {
    const response = await client.post('/registrations/', data);
    return response.data;
  },

  getAll: async (status = '', search = '') => {
    const response = await client.get(`/registrations/?status=${status}&search=${search}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await client.get(`/registrations/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await client.put(`/registrations/${id}`, data);
    return response.data;
  },

  accept: async (id) => {
    const response = await client.post(`/registrations/${id}/accept`);
    return response.data;
  },

  reject: async (id) => {
    const response = await client.post(`/registrations/${id}/reject`);
    return response.data;
  }
};
