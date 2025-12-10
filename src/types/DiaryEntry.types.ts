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
 * La tabla solo tiene: id, user_id, title, content, mood, entry_date, created_at, updated_at
 */
export interface DiaryEntry {
  id: string;
  user_id: string;
  content: string;
  title: string | null;
  mood: string | null;
  entry_date: string;
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
