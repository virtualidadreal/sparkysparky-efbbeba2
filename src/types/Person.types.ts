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
  phone: string | null;
  category: string;
  notes: string | null;
  company: string | null;
  role: string | null;
  how_we_met: string | null;
  last_contact_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePersonInput {
  full_name: string;
  nickname?: string;
  email?: string;
  phone?: string;
  category?: string;
  notes?: string;
  company?: string;
  role?: string;
  how_we_met?: string;
  last_contact_date?: string;
}

export interface UpdatePersonInput {
  full_name?: string;
  nickname?: string;
  email?: string;
  phone?: string;
  category?: string;
  notes?: string;
  company?: string;
  role?: string;
  how_we_met?: string;
  last_contact_date?: string;
}

export interface PeopleFilters {
  category?: string;
  search?: string;
}
