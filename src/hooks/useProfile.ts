import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';
import type { Json } from '@/integrations/supabase/types';

export interface NotificationPreferences {
  task_reminders: boolean;
  weekly_summary: boolean;
  product_updates: boolean;
}

export interface UserPreferences {
  notifications: NotificationPreferences;
  theme: 'light' | 'dark';
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  preferences: UserPreferences | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileInput {
  display_name?: string | null;
  avatar_url?: string | null;
  preferences?: UserPreferences | null;
}

const defaultPreferences: UserPreferences = {
  notifications: {
    task_reminders: true,
    weekly_summary: true,
    product_updates: false,
  },
  theme: 'light',
};

const parsePreferences = (json: Json | null): UserPreferences | null => {
  if (!json) return null;
  if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
    const obj = json as Record<string, unknown>;
    if ('notifications' in obj && 'theme' in obj) {
      return obj as unknown as UserPreferences;
    }
  }
  return defaultPreferences;
};

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        preferences: parsePreferences(data.preferences),
      } as Profile;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: UpdateProfileInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      // Convert preferences to Json type
      const dbUpdates: Record<string, unknown> = {};
      if (updates.display_name !== undefined) dbUpdates.display_name = updates.display_name;
      if (updates.avatar_url !== undefined) dbUpdates.avatar_url = updates.avatar_url;
      if (updates.preferences !== undefined) dbUpdates.preferences = updates.preferences as unknown as Json;

      const { data, error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      return {
        ...data,
        preferences: parsePreferences(data.preferences),
      } as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Perfil actualizado');
    },
    onError: (error: Error) => {
      console.error('Error al actualizar perfil:', error);
      toast.error('Error al actualizar el perfil');
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Contraseña actualizada');
    },
    onError: (error: Error) => {
      console.error('Error al actualizar contraseña:', error);
      toast.error('Error al actualizar la contraseña');
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return {
        ...data,
        preferences: parsePreferences(data.preferences),
      } as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Avatar actualizado');
    },
    onError: (error: Error) => {
      console.error('Error al subir avatar:', error);
      toast.error('Error al subir el avatar');
    },
  });
};
