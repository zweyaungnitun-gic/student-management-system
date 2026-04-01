import client from './client';

export const resultService = {
  getAll: async (params = {}) => {
    const response = await client.get('/results', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await client.get(`/results/${id}`);
    return response.data;
  },

  getByTest: async (testId) => {
    const response = await client.get(`/results/test/${testId}`);
    return response.data;
  },

  getByStudent: async (studentId, params = {}) => {
    const response = await client.get(`/results/student/${studentId}`, { params });
    return response.data;
  },

  getByCourse: async (courseId) => {
    const response = await client.get(`/results/course/${courseId}`);
    return response.data;
  },

  getStatistics: async (testId) => {
    const response = await client.get(`/results/test/${testId}/statistics`);
    return response.data;
  },

  create: async (data) => {
    const response = await client.post('/results', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await client.put(`/results/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await client.delete(`/results/${id}`);
    return response.data;
  },

  bulkUpload: async (testId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('testId', testId);
    const response = await client.post('/results/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};