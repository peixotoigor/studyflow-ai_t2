import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { ErrorLog } from '../types';

export const useErrorLogs = () => {
  return useQuery({
    queryKey: ['error-logs'],
    queryFn: async () => {
      const response = await api.get<{ logs: ErrorLog[] }>('/error-logs');
      return response.data.logs;
    }
  });
};

export const useCreateErrorLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      subjectId: string;
      topicName: string;
      questionSource: string;
      reason: 'KNOWLEDGE_GAP' | 'ATTENTION' | 'INTERPRETATION' | 'TRICK' | 'TIME';
      description: string;
      correction: string;
      reviewCount?: number;
    }) => {
      const response = await api.post<{ log: ErrorLog }>('/error-logs', data);
      return response.data.log;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['error-logs'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
  });
};

export const useUpdateErrorLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      subjectId?: string;
      topicName?: string;
      questionSource?: string;
      reason?: 'KNOWLEDGE_GAP' | 'ATTENTION' | 'INTERPRETATION' | 'TRICK' | 'TIME';
      description?: string;
      correction?: string;
      reviewCount?: number;
    }) => {
      const response = await api.put<{ log: ErrorLog }>(`/error-logs/${id}`, data);
      return response.data.log;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['error-logs'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
  });
};

export const useDeleteErrorLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/error-logs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['error-logs'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
  });
};
