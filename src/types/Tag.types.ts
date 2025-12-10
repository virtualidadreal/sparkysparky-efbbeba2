/**
 * Tipos TypeScript para el módulo de Tags
 */

/**
 * Tipos de etiquetas soportados
 */
export type TagType = 'thematic' | 'person' | 'location' | 'emotion' | 'project';

/**
 * Interfaz principal de Tag
 */
export interface Tag {
  id: string;
  user_id: string;
  name: string;
  type: TagType;
  color: string;
  parent_tag_id: string | null;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Input para crear una nueva etiqueta
 */
export interface CreateTagInput {
  name: string;
  type: TagType;
  color?: string;
  parent_tag_id?: string;
}

/**
 * Input para actualizar una etiqueta
 */
export interface UpdateTagInput {
  name?: string;
  color?: string;
  parent_tag_id?: string;
}

/**
 * Filtros para listar etiquetas
 */
export interface TagsFilters {
  type?: TagType;
  search?: string;
}

/**
 * Relación entre idea y etiqueta
 */
export interface IdeaTag {
  id: string;
  idea_id: string;
  tag_id: string;
  created_at: string;
}
