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
    const response = await client.patch(`/courses/${id}`, { is_active: true });
    return response.data;
  },

  deactivate: async (id) => {
    const response = await client.patch(`/courses/${id}`, { is_active: false });
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
    // This endpoint exists in backend: /courses/{id}/average-score
    const response = await client.get(`/courses/${id}/average-score`);
    return response.data;
  },

  exportStudents: async (id) => {
    const response = await client.get(`/courses/${id}/export-students`, {
      responseType: 'blob'
    });
    return response.data;
  },

  getByTeacher: async (teacherId) => {
    const response = await client.get('/courses', { params: { teacher_id: teacherId } });
    return response.data;
  }
};