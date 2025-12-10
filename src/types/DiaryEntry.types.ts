/**
 * Tipos TypeScript para el módulo de Diario
 */

/**
 * Tipo de momento del día
 */
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * Tipo de sentimiento
 */
export type Sentiment = 'positive' | 'neutral' | 'negative';

/**
 * Interfaz para emociones
 */
export interface Emotion {
  name: string;
  intensity: number; // 1-10
}

/**
 * Interfaz principal de DiaryEntry
 */
export interface DiaryEntry {
  id: string;
  user_id: string;
  content: string;
  title: string | null;
  audio_url: string | null;
  transcription: string | null;
  
  // Análisis emocional
  sentiment: Sentiment | null;
  mood_score: number | null;
  emotions: Emotion[];
  
  // Metadatos temporales
  time_of_day: TimeOfDay | null;
  
  // Geolocalización
  location_name: string | null;
  location_coordinates: {
    lat: number;
    lng: number;
  } | null;
  
  // Relaciones
  mentioned_people: string[];
  related_ideas: string[];
  related_projects: string[];
  
  // Superresúmenes
  daily_summary: string | null;
  weekly_summary: string | null;
  monthly_summary: string | null;
  
  // Metadata
  metadata: Record<string, any>;
  
  created_at: string;
  updated_at: string;
}

/**
 * Input para crear una entrada de diario
 */
export interface CreateDiaryEntryInput {
  content: string;
  title?: string;
  audio_url?: string;
  transcription?: string;
  location_name?: string;
  location_coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * Input para actualizar una entrada de diario
 */
export interface UpdateDiaryEntryInput {
  content?: string;
  title?: string;
  sentiment?: Sentiment;
  mood_score?: number;
  emotions?: Emotion[];
  time_of_day?: TimeOfDay;
}

/**
 * Filtros para listar entradas de diario
 */
export interface DiaryEntriesFilters {
  sentiment?: Sentiment;
  time_of_day?: TimeOfDay;
  date_from?: string;
  date_to?: string;
  search?: string;
}
