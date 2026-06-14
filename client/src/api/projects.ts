import api from './axios';
import type { ProjectListItem, ProjectOut } from '../types';

export const getProjects = async (): Promise<ProjectListItem[]> => {
  const response = await api.get<ProjectListItem[]>('/api/projects/');
  return response.data;
};

export const getProject = async (id: number): Promise<ProjectOut> => {
  const response = await api.get<ProjectOut>(`/api/projects/${id}`);
  return response.data;
};

export const deleteProject = async (id: number): Promise<any> => {
  const response = await api.delete<any>(`/api/projects/${id}`);
  return response.data;
};
