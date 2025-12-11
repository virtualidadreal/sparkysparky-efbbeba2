/**
 * Tipos TypeScript para el módulo de Diario
 * Alineados con la tabla diary_entries en Supabase
 */

/**
 * Tipo de sentimiento
 */
export type Sentiment = 'positive' | 'neutral' | 'negative';

/**
 * Tipo de momento del día
 */
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * Interfaz principal de DiaryEntry - alineada con DB actual
 */
export interface DiaryEntry {
  id: string;
  user_id: string;
  content: string;
  title: string | null;
  summary: string | null;
  mood: string | null;
  entry_date: string;
  tags: string[];
  related_people: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Input para crear una entrada de diario
 */
export interface CreateDiaryEntryInput {
  content: string;
  title?: string;
  mood?: string;
}

/**
 * Input para actualizar una entrada de diario
 */
export interface UpdateDiaryEntryInput {
  content?: string;
  title?: string;
  mood?: string;
}

/**
 * Filtros para listar entradas de diario
 */
export interface DiaryEntriesFilters {
  mood?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}
