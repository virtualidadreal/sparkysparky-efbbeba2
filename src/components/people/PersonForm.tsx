import { useState, FormEvent } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/common';
import { useCreatePerson, useUpdatePerson } from '@/hooks/usePeople';
import type { Person, CreatePersonInput, UpdatePersonInput } from '@/types/Person.types';

/**
 * Props del componente PersonForm
 */
interface PersonFormProps {
  isOpen: boolean;
  onClose: () => void;
  person?: Person | null;
}

type CategoryType = 'family' | 'friend' | 'colleague' | 'mentor' | 'client';

/**
 * Componente PersonForm (simplificado)
 * 
 * Modal para crear o editar contactos
 * Nota: La tabla "people" no existe aún
 */
export const PersonForm = ({ isOpen, onClose, person }: PersonFormProps) => {
  const [fullName, setFullName] = useState(person?.full_name || '');
  const [nickname, setNickname] = useState(person?.nickname || '');
  const [email, setEmail] = useState(person?.email || '');
  const [category, setCategory] = useState<CategoryType>(
    (person?.category as CategoryType) || 'friend'
  );
  const [notes, setNotes] = useState(person?.notes || '');

  const createPerson = useCreatePerson();
  const updatePerson = useUpdatePerson();

  const isEditing = !!person;
  const isLoading = createPerson.isPending || updatePerson.isPending;

  const categories = [
    { value: 'family', label: 'Familia' },
    { value: 'friend', label: 'Amigo/a' },
    { value: 'colleague', label: 'Colega' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'client', label: 'Cliente' },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) return;

    try {
      const personData = {
        full_name: fullName.trim(),
        nickname: nickname.trim() || undefined,
        email: email.trim() || undefined,
        category,
        notes: notes.trim() || undefined,
      };

      if (isEditing && person) {
        await updatePerson.mutateAsync({
          id: person.id,
          updates: personData as UpdatePersonInput,
        });
      } else {
        await createPerson.mutateAsync(personData as CreatePersonInput);
      }

      handleClose();
    } catch (error) {
      // Los errores se manejan en los hooks con toast
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFullName('');
      setNickname('');
      setEmail('');
      setCategory('friend');
      setNotes('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-white rounded-lg shadow-xl my-8">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Editar Contacto' : 'Añadir Contacto'}
            </Dialog.Title>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Nombre completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>

            {/* Nickname y Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apodo
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Ej: Juanito"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                required
                disabled={isLoading}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas sobre esta persona..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={handleClose}
                variant="secondary"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                disabled={!fullName.trim()}
              >
                {isEditing ? 'Guardar cambios' : 'Añadir contacto'}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
