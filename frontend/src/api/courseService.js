import client from './client';

export const courseService = {
  getAll: async (search = '', activeOnly = false) => {
    const response = await client.get(`/courses/?search=${search}&active_only=${activeOnly}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await client.get(`/courses/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await client.post('/courses/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await client.put(`/courses/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await client.delete(`/courses/${id}`);
    return response.data;
  },

  getEnrollments: async (id) => {
    const response = await client.get(`/courses/${id}/enrollments`);
    return response.data;
  },

  getTests: async (id) => {
    const response = await client.get(`/courses/${id}/tests`);
    return response.data;
  },

  getAverageScore: async (id) => {
    const response = await client.get(`/courses/${id}/average-score`);
    return response.data;
  }
};
