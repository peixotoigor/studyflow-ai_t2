import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { SimulatedExam } from '../types';

export const useSimulatedExams = () => {
  return useQuery({
    queryKey: ['simulated-exams'],
    queryFn: async () => {
      const response = await api.get<{ exams: SimulatedExam[] }>('/simulated-exams');
      return response.data.exams;
    }
  });
};

export const useCreateSimulatedExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      planId: string;
      title: string;
      institution: string;
      date: Date | string;
      totalQuestions: number;
      correctAnswers: number;
      notes?: string;
    }) => {
      const response = await api.post<{ exam: SimulatedExam }>('/simulated-exams', {
        ...data,
        date: typeof data.date === 'string' ? data.date : data.date.toISOString()
      });
      return response.data.exam;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulated-exams'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
  });
};

export const useUpdateSimulatedExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      planId?: string;
      title?: string;
      institution?: string;
      date?: Date | string;
      totalQuestions?: number;
      correctAnswers?: number;
      notes?: string;
    }) => {
      const response = await api.put<{ exam: SimulatedExam }>(`/simulated-exams/${id}`, {
        ...data,
        date: data.date ? (typeof data.date === 'string' ? data.date : data.date.toISOString()) : undefined
      });
      return response.data.exam;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulated-exams'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
  });
};

export const useDeleteSimulatedExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/simulated-exams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulated-exams'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
  });
};
