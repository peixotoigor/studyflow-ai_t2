import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { Subject, Topic } from '../types';

export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      planId: string;
      name: string;
      active?: boolean;
      color?: string;
      weight?: number;
      priority?: 'HIGH' | 'MEDIUM' | 'LOW';
      proficiency?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    }) => {
      const response = await api.post<{ subject: Subject }>('/subjects', data);
      return response.data.subject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      name?: string;
      active?: boolean;
      color?: string;
      weight?: number;
      priority?: 'HIGH' | 'MEDIUM' | 'LOW';
      proficiency?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    }) => {
      const response = await api.put<{ subject: Subject }>(`/subjects/${id}`, data);
      return response.data.subject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/subjects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
  });
};

export const useCreateTopic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ subjectId, ...data }: { subjectId: string; name: string; completed?: boolean }) => {
      const response = await api.post<{ topic: Topic }>(`/subjects/${subjectId}/topics`, data);
      return response.data.topic;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
  });
};

export const useUpdateTopic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ subjectId, topicId, ...data }: {
      subjectId: string;
      topicId: string;
      name?: string;
      completed?: boolean;
    }) => {
      const response = await api.put<{ topic: Topic }>(`/subjects/${subjectId}/topics/${topicId}`, data);
      return response.data.topic;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
  });
};

export const useDeleteTopic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ subjectId, topicId }: { subjectId: string; topicId: string }) => {
      await api.delete(`/subjects/${subjectId}/topics/${topicId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
  });
};
