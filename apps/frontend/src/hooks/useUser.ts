import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export interface UserSettings {
  dailyAvailableTimeMinutes: number;
  openAiModel: string;
  hasOpenAiApiKey: boolean;
  hasGithubToken: boolean;
  backupGistId: string | null;
  avatarUrl?: string | null;
  openAiApiKeyDecrypted?: string | null;
  githubTokenDecrypted?: string | null;
  scheduleSettings?: any;
  scheduleSelection?: string[] | null;
}

export interface UserWithSettings {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  settings: UserSettings;
}

export const useUser = () => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response = await api.get<UserWithSettings>('/auth/me');
      return response.data;
    },
    enabled: !!token,
    retry: 1,
    retryOnMount: false,
    staleTime: 1000 * 60 * 5 // 5 minutos
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name?: string; email?: string; currentPassword?: string }) => {
      const response = await api.put<{ user: UserWithSettings['user'] }>('/auth/me', data);
      return response.data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    }
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await api.put<{ message: string }>('/auth/password', data);
      return response.data;
    }
  });
};

export const useUserSettings = () => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['user', 'settings'],
    queryFn: async () => {
      try {
        const response = await api.get<{ settings: UserSettings }>('/auth/settings');
        return response.data.settings;
      } catch (error: any) {
        // Se o endpoint não existir ou retornar 404, tentar extrair do /auth/me
        if (error.response?.status === 404) {
          const meResponse = await api.get<UserWithSettings>('/auth/me');
          return meResponse.data.settings;
        }
        throw error;
      }
    },
    enabled: !!token,
    retry: 0, // Não retry - se falhar, usamos settings do /auth/me
    retryOnMount: false
  });
};

export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      dailyAvailableTimeMinutes?: number;
      openAiApiKey?: string | null;
      openAiModel?: string;
      githubToken?: string | null;
      backupGistId?: string | null;
      avatarUrl?: string | null;
      openAiApiKeyDecrypted?: string | null;
      githubTokenDecrypted?: string | null;
      scheduleSettings?: any;
      scheduleSelection?: string[] | null;
    }) => {
      const response = await api.put<{ settings: UserSettings }>('/auth/settings', data);
      return response.data.settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    }
  });
};
