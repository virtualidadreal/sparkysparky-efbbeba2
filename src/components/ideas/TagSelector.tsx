import { useState } from 'react';
import { useTags, useAddTagToIdea, useRemoveTagFromIdea, useIdeaTags, useCreateTag } from '@/hooks/useTags';
import { Popover } from '@headlessui/react';
import { TagIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { TagType } from '@/types/Tag.types';
import clsx from 'clsx';

interface TagSelectorProps {
  ideaId: string;
}

const TAG_TYPE_LABELS: Record<TagType, string> = {
  thematic: 'Temático',
  person: 'Persona',
  location: 'Ubicación',
  emotion: 'Emoción',
  project: 'Proyecto',
};

/**
 * Componente TagSelector
 * 
 * Selector de etiquetas con:
 * - Popover para buscar y agregar etiquetas
 * - Creación rápida de nuevas etiquetas
 * - Agrupación por tipo
 * - Colores diferenciados
 */
export const TagSelector = ({ ideaId }: TagSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<TagType | 'all'>('all');
  const [newTagName, setNewTagName] = useState('');
  const [newTagType, setNewTagType] = useState<TagType>('thematic');

  const { data: allTags = [] } = useTags();
  const { data: ideaTags = [] } = useIdeaTags(ideaId);
  const addTagToIdea = useAddTagToIdea();
  const removeTagFromIdea = useRemoveTagFromIdea();
  const createTag = useCreateTag();

  // IDs de etiquetas ya asignadas
  const assignedTagIds = new Set(ideaTags.map(tag => tag.id));

  // Filtrar etiquetas disponibles
  const availableTags = allTags.filter(tag => {
    if (assignedTagIds.has(tag.id)) return false;
    if (selectedType !== 'all' && tag.type !== selectedType) return false;
    if (searchTerm && !tag.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleAddTag = async (tagId: string) => {
    await addTagToIdea.mutateAsync({ ideaId, tagId });
  };

  const handleRemoveTag = async (tagId: string) => {
    await removeTagFromIdea.mutateAsync({ ideaId, tagId });
  };

  const handleCreateAndAdd = async () => {
    if (!newTagName.trim()) return;

    const newTag = await createTag.mutateAsync({
      name: newTagName.trim(),
      type: newTagType,
    });

    await addTagToIdea.mutateAsync({ ideaId, tagId: newTag.id });
    
    setNewTagName('');
    setNewTagType('thematic');
  };

  // Agrupar etiquetas asignadas por tipo
  const tagsByType = ideaTags.reduce((acc, tag) => {
    if (!acc[tag.type]) acc[tag.type] = [];
    acc[tag.type].push(tag);
    return acc;
  }, {} as Record<TagType, typeof ideaTags>);

  return (
    <div className="space-y-2">
      {/* Etiquetas asignadas */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(tagsByType).map(([type, tags]) => (
          <div key={type} className="flex flex-wrap gap-1">
            {tags.map(tag => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
                <button
                  onClick={() => handleRemoveTag(tag.id)}
                  className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  title="Remover etiqueta"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        ))}

        {/* Botón para agregar etiquetas */}
        <Popover className="relative">
          <Popover.Button className="inline-flex items-center gap-1 px-2 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <PlusIcon className="h-3 w-3" />
            Agregar etiqueta
          </Popover.Button>

          <Popover.Panel className="absolute z-10 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
            {/* Búsqueda */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Buscar etiquetas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Filtro por tipo */}
            <div className="flex gap-1 mb-3 overflow-x-auto">
              <button
                onClick={() => setSelectedType('all')}
                className={clsx(
                  'px-2 py-1 rounded text-xs font-medium whitespace-nowrap',
                  selectedType === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                )}
              >
                Todas
              </button>
              {Object.entries(TAG_TYPE_LABELS).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type as TagType)}
                  className={clsx(
                    'px-2 py-1 rounded text-xs font-medium whitespace-nowrap',
                    selectedType === type ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Lista de etiquetas disponibles */}
            <div className="max-h-40 overflow-y-auto space-y-1 mb-3">
              {availableTags.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">
                  No hay etiquetas disponibles
                </p>
              ) : (
                availableTags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => handleAddTag(tag.id)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 text-left text-sm"
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="flex-1 truncate">{tag.name}</span>
                    <span className="text-xs text-gray-500">
                      {TAG_TYPE_LABELS[tag.type]}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Crear nueva etiqueta */}
            <div className="border-t pt-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Crear nueva etiqueta</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nombre..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateAndAdd()}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <select
                  value={newTagType}
                  onChange={(e) => setNewTagType(e.target.value as TagType)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {Object.entries(TAG_TYPE_LABELS).map(([type, label]) => (
                    <option key={type} value={type}>{label}</option>
                  ))}
                </select>
                <button
                  onClick={handleCreateAndAdd}
                  disabled={!newTagName.trim()}
                  className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Popover.Panel>
        </Popover>
      </div>
    </div>
  );
};
