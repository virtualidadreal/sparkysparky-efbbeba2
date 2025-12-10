import { useState, useMemo, useCallback } from 'react';
import { useIdeas } from './useIdeas';
import { useTasks } from './useTasks';
import { useProjects } from './useProjects';
import { usePeople } from './usePeople';
import { useDiaryEntries } from './useDiaryEntries';
import type { Idea } from '@/types/Idea.types';
import type { Task } from '@/types/Task.types';
import type { Project } from '@/types/Project.types';
import type { Person } from '@/types/Person.types';
import type { DiaryEntry } from '@/types/DiaryEntry.types';

export type SearchResultType = 'idea' | 'task' | 'project' | 'person' | 'diary';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description?: string;
  tags?: string[];
  createdAt: string;
  raw: Idea | Task | Project | Person | DiaryEntry;
}

/**
 * Hook para búsqueda global en ideas, tareas, proyectos, personas y diario
 */
export const useGlobalSearch = (searchTerm: string) => {
  const { data: ideas } = useIdeas();
  const { data: tasks } = useTasks();
  const { data: projects } = useProjects();
  const { data: people } = usePeople();
  const { data: diaryEntries } = useDiaryEntries();

  const results = useMemo<SearchResult[]>(() => {
    if (!searchTerm || searchTerm.length < 2) return [];

    const term = searchTerm.toLowerCase();
    const allResults: SearchResult[] = [];

    // Buscar en ideas
    ideas?.forEach((idea) => {
      const searchableText = [
        idea.title,
        idea.description,
        idea.original_content,
        idea.summary,
        ...(idea.tags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (searchableText.includes(term)) {
        allResults.push({
          id: idea.id,
          type: 'idea',
          title: idea.title || 'Idea sin título',
          description: idea.summary || idea.description || idea.original_content,
          tags: idea.tags,
          createdAt: idea.created_at,
          raw: idea,
        });
      }
    });

    // Buscar en tareas
    tasks?.forEach((task) => {
      const searchableText = [task.title, task.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (searchableText.includes(term)) {
        allResults.push({
          id: task.id,
          type: 'task',
          title: task.title,
          description: task.description || undefined,
          createdAt: task.created_at,
          raw: task,
        });
      }
    });

    // Buscar en proyectos
    projects?.forEach((project) => {
      const searchableText = [
        project.title,
        project.description,
        ...(project.tags || []),
        ...(project.keywords || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (searchableText.includes(term)) {
        allResults.push({
          id: project.id,
          type: 'project',
          title: project.title,
          description: project.description || undefined,
          tags: project.tags,
          createdAt: project.created_at,
          raw: project,
        });
      }
    });

    // Buscar en personas
    people?.forEach((person) => {
      const searchableText = [
        person.full_name,
        person.nickname,
        person.company,
        person.role,
        person.notes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (searchableText.includes(term)) {
        allResults.push({
          id: person.id,
          type: 'person',
          title: person.full_name,
          description: person.company ? `${person.role || ''} @ ${person.company}` : person.role,
          createdAt: person.created_at,
          raw: person,
        });
      }
    });

    // Buscar en diario
    diaryEntries?.forEach((entry) => {
      const searchableText = [entry.title, entry.content]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (searchableText.includes(term)) {
        allResults.push({
          id: entry.id,
          type: 'diary',
          title: entry.title || `Entrada del ${entry.entry_date}`,
          description: entry.content?.substring(0, 100),
          createdAt: entry.created_at,
          raw: entry,
        });
      }
    });

    // Ordenar por fecha de creación (más reciente primero)
    return allResults.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [searchTerm, ideas, tasks, projects, people, diaryEntries]);

  return { results };
};
