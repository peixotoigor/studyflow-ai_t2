import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { StudyLog } from '../types';

export const useStudyLogs = () => {
  return useQuery({
    queryKey: ['study-logs'],
    queryFn: async () => {
      const response = await api.get<{ logs: StudyLog[] }>('/study-logs');
      return response.data.logs;
    }
  });
};

export const useCreateStudyLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      subjectId: string;
      topicId?: string;
      topicName: string;
      date: Date | string;
      durationMinutes: number;
      questionsCount?: number;
      correctCount?: number;
      modalities?: string[];
      notes?: string;
    }) => {
      const response = await api.post<{ log: StudyLog }>('/study-logs', {
        ...data,
        date: typeof data.date === 'string' ? data.date : data.date.toISOString()
      });
      return response.data.log;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-logs'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
  });
};

export const useUpdateStudyLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      subjectId?: string;
      topicId?: string;
      topicName?: string;
      date?: Date | string;
      durationMinutes?: number;
      questionsCount?: number;
      correctCount?: number;
      modalities?: string[];
      notes?: string;
    }) => {
      const response = await api.put<{ log: StudyLog }>(`/study-logs/${id}`, {
        ...data,
        date: data.date ? (typeof data.date === 'string' ? data.date : data.date.toISOString()) : undefined
      });
      return response.data.log;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-logs'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
  });
};

export const useDeleteStudyLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/study-logs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-logs'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
  });
};
