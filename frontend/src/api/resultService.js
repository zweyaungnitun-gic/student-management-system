import client from './client';

export const resultService = {
  getByTest: async (testId) => {
    const response = await client.get(`/results/test/${testId}`);
    return response.data;
  },

  getByStudent: async (studentId) => {
    const response = await client.get(`/results/student/${studentId}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await client.get(`/results/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await client.post('/results/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await client.put(`/results/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await client.delete(`/results/${id}`);
    return response.data;
  }
};
