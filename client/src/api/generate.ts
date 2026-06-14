import api from './axios';
import type { GenerateResponse } from '../types';

export const generateArtifacts = async (description: string): Promise<GenerateResponse> => {
  const response = await api.post<GenerateResponse>('/api/generate', { description });
  return response.data;
};
