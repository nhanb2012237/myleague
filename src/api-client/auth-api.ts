import { LoginPayload } from '../models/auth';
import axiosClient from './axios-client';

export const authApi = {
  login(payload: LoginPayload) {
    return axiosClient.post('/auth/login', payload);
  },

  logout() {
    return axiosClient.post('/logout');
  },

  getProfile() {
    return axiosClient.get('/profile');
  },
};
