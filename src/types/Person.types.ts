/**
 * Tipos TypeScript para el módulo de People (CRM Personal)
 */

/**
 * Interfaz principal de Person
 */
export interface Person {
  id: string;
  user_id: string;
  full_name: string;
  nickname: string | null;
  email: string | null;
  category: 'family' | 'friend' | 'colleague' | 'mentor' | 'client';
  importance_level: number; // 1-5
  last_contact_date: string | null;
  last_contact_summary: string | null;
  desired_contact_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | null;
  needs_attention: boolean;
  tags: string[];
  interests: string[];
  birthday: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Input para crear una nueva persona
 */
export interface CreatePersonInput {
  full_name: string;
  nickname?: string;
  email?: string;
  category: 'family' | 'friend' | 'colleague' | 'mentor' | 'client';
  importance_level?: number;
  desired_contact_frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  birthday?: string;
  interests?: string[];
  tags?: string[];
}

/**
 * Input para actualizar una persona
 */
export interface UpdatePersonInput {
  full_name?: string;
  nickname?: string;
  email?: string;
  category?: 'family' | 'friend' | 'colleague' | 'mentor' | 'client';
  importance_level?: number;
  last_contact_date?: string;
  last_contact_summary?: string;
  desired_contact_frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | null;
  needs_attention?: boolean;
  birthday?: string;
  interests?: string[];
  tags?: string[];
}

/**
 * Filtros para listar personas
 */
export interface PeopleFilters {
  category?: 'family' | 'friend' | 'colleague' | 'mentor' | 'client';
  needs_attention?: boolean;
  search?: string;
}
