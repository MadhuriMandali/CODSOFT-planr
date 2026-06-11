import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: d => api.post('/auth/register', d),
  login:    d => api.post('/auth/login', d),
  me:       () => api.get('/auth/me'),
};

export const projectAPI = {
  list:   ()       => api.get('/projects'),
  create: d        => api.post('/projects', d),
  update: (id,d)   => api.put(`/projects/${id}`, d),
  remove: id       => api.delete(`/projects/${id}`),
};

export const taskAPI = {
  list:   pid       => api.get(`/projects/${pid}/tasks`),
  create: (pid,d)   => api.post(`/projects/${pid}/tasks`, d),
  update: (pid,tid,d)=> api.put(`/projects/${pid}/tasks/${tid}`, d),
  remove: (pid,tid)  => api.delete(`/projects/${pid}/tasks/${tid}`),
};

export default api;
