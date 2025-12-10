/**
 * Tipos TypeScript para el módulo de People (CRM Personal)
 * 
 * NOTA: La tabla 'people' no existe en la base de datos actual.
 * Este archivo define tipos placeholder para uso futuro.
 */

/**
 * Interfaz placeholder de Person
 */
export interface Person {
  id: string;
  user_id: string;
  full_name: string;
  nickname: string | null;
  email: string | null;
  category: string;
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
  category?: string;
}

/**
 * Input para actualizar una persona
 */
export interface UpdatePersonInput {
  full_name?: string;
  nickname?: string;
  email?: string;
  category?: string;
}

/**
 * Filtros para listar personas
 */
export interface PeopleFilters {
  category?: string;
  search?: string;
}
