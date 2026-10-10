import { api, apiBase } from './client';

const get = (url, params, signal) => api.get(url, { params, signal }).then((res) => res.data);

export const getProjects = (params, signal) => get('/projects', params, signal);
export const getProject = (slug, signal) => get(`/projects/${encodeURIComponent(slug)}`, undefined, signal);
export const getSkills = (params, signal) => get('/skills', params, signal);
export const getExperience = (params, signal) => get('/experience', params, signal);
export const getPosts = (params, signal) => get('/posts', params, signal);
export const getPost = (slug, signal) => get(`/posts/${encodeURIComponent(slug)}`, undefined, signal);

export const sendMessage = (payload) => api.post('/contact', payload).then((res) => res.data);

export const resumeUrl = `${apiBase}/resume`;

export const getProfile = (signal) => get('/profile', undefined, signal);

export const getGithub = (signal) => get('/github', undefined, signal);
export const getResumeInfo = (signal) => get('/resume/info', undefined, signal);
