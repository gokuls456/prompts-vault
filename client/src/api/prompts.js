import api from './axios';

export const promptsAPI = {
  // Public
  getAll: (params) => api.get('/prompts', { params }),
  getById: (id) => api.get(`/prompts/${id}`),
  getCategories: () => api.get('/prompts/categories'),

  // Admin
  create: (formData) =>
    api.post('/prompts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id, formData) =>
    api.put(`/prompts/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id) => api.delete(`/prompts/${id}`),
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  delete: (id) => api.delete(`/users/${id}`),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
};
