import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { SummaryResponse } from '@shared/types/domain.js';
import { useAuth } from '../contexts/AuthContext';

export const SummaryKeys = {
  all: ['summary'] as const
};

export const useSummary = () => {
  const { token } = useAuth();
  return useQuery({
    queryKey: SummaryKeys.all,
    queryFn: async () => {
      const response = await api.get<SummaryResponse>('/summary');
      return response.data;
    },
    staleTime: 1000 * 60, // 1 minuto
    enabled: !!token,
    retry: 1
  });
};
