import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { StudyPlan } from '../types';

export const usePlans = () => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const response = await api.get<{ plans: StudyPlan[] }>('/plans');
      return response.data.plans;
    },
    enabled: !!token,
    retry: 1,
    staleTime: 1000 * 60 // 1 minuto
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; color?: string }) => {
      const response = await api.post<{ plan: StudyPlan }>('/plans', data);
      return response.data.plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; description?: string; color?: string; editalFiles?: any[] }) => {
      const response = await api.put<{ plan: StudyPlan }>(`/plans/${id}`, data);
      return response.data.plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/plans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
  });
};
