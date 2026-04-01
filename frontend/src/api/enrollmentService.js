import client from './client';

export const enrollmentService = {
  getAll: async (studentId = '', courseId = '') => {
    let url = '/enrollments/';
    const params = new URLSearchParams();
    if (studentId) params.append('student_id', studentId);
    if (courseId) params.append('course_id', courseId);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await client.get(url);
    return response.data;
  },

  getByStudent: async (studentId) => {
    const response = await client.get('/enrollments/', { params: { student_id: studentId } });
    return response.data;
  },

  getById: async (id) => {
    const response = await client.get(`/enrollments/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await client.post('/enrollments/', data);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await client.patch(`/enrollments/${id}/status?status=${status}`);
    return response.data;
  },

  delete: async (id) => {
    const response = await client.delete(`/enrollments/${id}`);
    return response.data;
  }
};
