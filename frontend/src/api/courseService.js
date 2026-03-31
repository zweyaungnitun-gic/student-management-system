import client from './client';

export const courseService = {
  getAll: async (params = {}) => {
    const response = await client.get('/courses', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await client.get(`/courses/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await client.post('/courses', data);
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

  activate: async (id) => {
    const response = await client.post(`/courses/activate/${id}`);
    return response.data;
  },

  deactivate: async (id) => {
    const response = await client.post(`/courses/deactivate/${id}`);
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

  getStatistics: async (id) => {
    const response = await client.get(`/courses/${id}/statistics`);
    return response.data;
  },

  exportStudents: async (id) => {
    const response = await client.get(`/courses/export/${id}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  getByTeacher: async (teacherId) => {
    const response = await client.get(`/courses/teacher/${teacherId}`);
    return response.data;
  }
};