import api from './axios';
import type { User } from '../types';

export const registerUser = async (email: string, password: string): Promise<User> => {
  const response = await api.post<User>('/api/auth/register', { email, password });
  return response.data;
};

export const loginUser = async (email: string, password: string): Promise<any> => {
  const response = await api.post<any>('/api/auth/login', { email, password });
  return response.data;
};

export const logoutUser = async (): Promise<any> => {
  const response = await api.post<any>('/api/auth/logout');
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/api/auth/me');
  return response.data;
};
