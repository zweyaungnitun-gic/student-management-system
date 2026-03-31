import api from './client';

export const registrationLinkService = {
  // Get all my registration links
  getMyLinks: () => api.get('/registration-links/'),

  // Create a new registration link
  createLink: (data) => api.post('/registration-links/', data),

  // Get specific link details
  getLink: (id) => api.get(`/registration-links/${id}`),

  // Update a link
  updateLink: (id, data) => api.put(`/registration-links/${id}`, data),

  // Delete a link
  deleteLink: (id) => api.delete(`/registration-links/${id}`),

  // Regenerate token
  regenerateToken: (id) => api.post(`/registration-links/${id}/regenerate`),

  // Get pending registrations
  getPendingRegistrations: () => api.get('/registration-links/self-registrations/pending'),

  // Get all my registrations
  getAllRegistrations: (status) => {
    const params = status ? { status } : {};
    return api.get('/registration-links/self-registrations/all', { params });
  },

  // Get registration detail
  getRegistrationDetail: (id) => api.get(`/registration-links/self-registrations/${id}`),

  // Update registration status
  updateRegistrationStatus: (id, data) => api.put(`/registration-links/self-registrations/${id}/status`, data),

  // Convert registration to student
  convertToStudent: (id) => api.post(`/registration-links/self-registrations/${id}/convert`),

  // PUBLIC ENDPOINTS (No auth required)
  // Validate registration token
  validateToken: (token) => api.get(`/registration-links/public/validate/${token}`),

  // Submit self-registration
  submitRegistration: (data) => api.post('/registration-links/public/register', data),
};
