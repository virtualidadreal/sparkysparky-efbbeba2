/**
 * Tipos TypeScript para el módulo de People (CRM Personal)
 * 
 * NOTA: La tabla 'people' no existe en la base de datos actual.
 * Este archivo define tipos placeholder para uso futuro.
 */

export interface Person {
  id: string;
  user_id: string;
  full_name: string;
  nickname: string | null;
  email: string | null;
  category: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePersonInput {
  full_name: string;
  nickname?: string;
  email?: string;
  category?: string;
  notes?: string;
}

export interface UpdatePersonInput {
  full_name?: string;
  nickname?: string;
  email?: string;
  category?: string;
  notes?: string;
}

export interface PeopleFilters {
  category?: string;
  search?: string;
}
