import { api } from '../api/client';

/** CRUD helper for a REST resource: projects, skills, experience, posts. */
export const resourceApi = (name) => ({
  list: (params) =>
    api.get(`/${name}`, { params: { limit: 100, ...params } }).then((res) => res.data),
  create: (body) => api.post(`/${name}`, body).then((res) => res.data.data),
  update: (id, body) => api.put(`/${name}/${id}`, body).then((res) => res.data.data),
  remove: (id) => api.delete(`/${name}/${id}`).then((res) => res.data),
});

export const getCount = (name) =>
  api.get(`/${name}`, { params: { limit: 1 } }).then((res) => res.data);

export const uploadImage = (file) => {
  const form = new FormData();
  form.append('image', file);
  return api.post('/upload/image', form).then((res) => res.data.data);
};

export const uploadResume = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/upload/resume', form).then((res) => res.data);
};

export const listMessages = (params) =>
  api.get('/messages', { params }).then((res) => res.data);
export const setMessageRead = (id, read) =>
  api.patch(`/messages/${id}`, { read }).then((res) => res.data.data);
export const deleteMessage = (id) => api.delete(`/messages/${id}`).then((res) => res.data);

export const updateProfile = (body) => api.put('/profile', body).then((res) => res.data.data);
export const changePassword = (body) => api.put('/auth/password', body).then((res) => res.data);
