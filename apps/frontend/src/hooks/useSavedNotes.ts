import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { SavedNote } from '../types';

export const useSavedNotes = () => {
  return useQuery({
    queryKey: ['saved-notes'],
    queryFn: async () => {
      const response = await api.get<{ notes: SavedNote[] }>('/saved-notes');
      return response.data.notes;
    }
  });
};

export const useCreateSavedNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      planId: string;
      subjectId?: string | null;
      content: string;
      topicName?: string;
      tags?: string[];
    }) => {
      const response = await api.post<{ note: SavedNote }>('/saved-notes', data);
      return response.data.note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-notes'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
  });
};

export const useUpdateSavedNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      planId?: string;
      subjectId?: string | null;
      content?: string;
      topicName?: string;
      tags?: string[];
    }) => {
      const response = await api.put<{ note: SavedNote }>(`/saved-notes/${id}`, data);
      return response.data.note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-notes'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
  });
};

export const useDeleteSavedNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/saved-notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-notes'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
  });
};
