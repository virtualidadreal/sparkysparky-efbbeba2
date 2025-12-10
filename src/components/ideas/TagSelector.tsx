import { useState } from 'react';
import { Popover } from '@headlessui/react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

interface TagSelectorProps {
  ideaId: string;
  tags?: string[];
  onTagsChange?: (tags: string[]) => void;
}

/**
 * Componente TagSelector (simplificado)
 * 
 * Selector de etiquetas local sin tabla de tags
 */
export const TagSelector = ({ ideaId, tags = [], onTagsChange }: TagSelectorProps) => {
  const [newTagName, setNewTagName] = useState('');

  const handleAddTag = () => {
    if (!newTagName.trim() || tags.includes(newTagName.trim())) return;
    onTagsChange?.([...tags, newTagName.trim()]);
    setNewTagName('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange?.(tags.filter(t => t !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      {/* Etiquetas asignadas */}
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary"
          >
            {tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
              title="Remover etiqueta"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </span>
        ))}

        {/* Botón para agregar etiquetas */}
        <Popover className="relative">
          <Popover.Button className="inline-flex items-center gap-1 px-2 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <PlusIcon className="h-3 w-3" />
            Agregar etiqueta
          </Popover.Button>

          <Popover.Panel className="absolute z-10 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
            <p className="text-xs font-medium text-gray-700 mb-2">Nueva etiqueta</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nombre..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                onClick={handleAddTag}
                disabled={!newTagName.trim()}
                className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </Popover.Panel>
        </Popover>
      </div>
    </div>
  );
};
