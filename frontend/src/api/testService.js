import client from './client';

export const testService = {
  getAll: async (params = {}) => {
    const response = await client.get('/tests', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await client.get(`/tests/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await client.post('/tests/add', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await client.put(`/tests/edit/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await client.delete(`/tests/delete/${id}`);
    return response.data;
  },

  getByCourse: async (courseId) => {
    const response = await client.get(`/tests/course/${courseId}`);
    return response.data;
  },

  getByTeacher: async (teacherId) => {
    const response = await client.get(`/tests/teacher/${teacherId}`);
    return response.data;
  }
};