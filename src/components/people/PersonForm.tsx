import { useState, FormEvent } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
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

/**
 * Componente PersonForm
 * 
 * Modal para crear o editar contactos del CRM personal
 */
export const PersonForm = ({ isOpen, onClose, person }: PersonFormProps) => {
  const [fullName, setFullName] = useState(person?.full_name || '');
  const [nickname, setNickname] = useState(person?.nickname || '');
  const [email, setEmail] = useState(person?.email || '');
  const [category, setCategory] = useState<'family' | 'friend' | 'colleague' | 'mentor' | 'client'>(
    person?.category || 'friend'
  );
  const [importanceLevel, setImportanceLevel] = useState(person?.importance_level || 3);
  const [desiredFrequency, setDesiredFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | ''>(
    person?.desired_contact_frequency || ''
  );
  const [birthday, setBirthday] = useState(person?.birthday || '');
  const [interestInput, setInterestInput] = useState('');
  const [interests, setInterests] = useState<string[]>(person?.interests || []);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(person?.tags || []);

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

  const frequencies = [
    { value: '', label: 'Sin preferencia' },
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'yearly', label: 'Anual' },
  ];

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) return;

    try {
      const personData = {
        full_name: fullName.trim(),
        nickname: nickname.trim() || undefined,
        email: email.trim() || undefined,
        category,
        importance_level: importanceLevel,
        desired_contact_frequency: desiredFrequency || undefined,
        birthday: birthday || undefined,
        interests,
        tags,
      };

      if (isEditing) {
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

  /**
   * Cerrar modal y limpiar form
   */
  const handleClose = () => {
    if (!isLoading) {
      setFullName('');
      setNickname('');
      setEmail('');
      setCategory('friend');
      setImportanceLevel(3);
      setDesiredFrequency('');
      setBirthday('');
      setInterests([]);
      setTags([]);
      setInterestInput('');
      setTagInput('');
      onClose();
    }
  };

  /**
   * Agregar interés
   */
  const handleAddInterest = () => {
    const interest = interestInput.trim();
    if (interest && !interests.includes(interest)) {
      setInterests([...interests, interest]);
      setInterestInput('');
    }
  };

  /**
   * Remover interés
   */
  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests(interests.filter(i => i !== interestToRemove));
  };

  /**
   * Agregar tag
   */
  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  /**
   * Remover tag
   */
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  /**
   * Renderizar estrellas de importancia (interactivas)
   */
  const renderImportanceStars = () => {
    return (
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Nivel de importancia">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === importanceLevel}
            aria-label={`Importancia ${star} de 5`}
            onClick={() => setImportanceLevel(star)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setImportanceLevel(star);
              }
            }}
            className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded transition-transform hover:scale-110"
          >
            {star <= importanceLevel ? (
              <StarSolid className="h-6 w-6 text-yellow-500" aria-hidden="true" />
            ) : (
              <StarOutline className="h-6 w-6 text-gray-300 hover:text-yellow-400" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-lg shadow-xl my-8">
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
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
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
                onChange={(e) => setCategory(e.target.value as any)}
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

            {/* Nivel de importancia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de importancia
              </label>
              {renderImportanceStars()}
            </div>

            {/* Frecuencia de contacto deseada */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frecuencia de contacto deseada
              </label>
              <select
                value={desiredFrequency}
                onChange={(e) => setDesiredFrequency(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                disabled={isLoading}
              >
                {frequencies.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Cumpleaños */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cumpleaños
              </label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            {/* Intereses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intereses
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddInterest();
                    }
                  }}
                  placeholder="Ej: Fotografía, viajes..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  onClick={handleAddInterest}
                  variant="secondary"
                  size="sm"
                  disabled={!interestInput.trim() || isLoading}
                >
                  Agregar
                </Button>
              </div>
              
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-2" role="list" aria-label="Intereses de la persona">
                  {interests.map((interest) => (
                    <span
                      key={interest}
                      role="listitem"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(interest)}
                        onKeyDown={(e) => {
                          if (e.key === 'Delete' || e.key === 'Backspace') {
                            handleRemoveInterest(interest);
                          }
                        }}
                        className="hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
                        disabled={isLoading}
                        aria-label={`Eliminar interés ${interest}`}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Etiquetas
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Ej: VIP, networking..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  variant="secondary"
                  size="sm"
                  disabled={!tagInput.trim() || isLoading}
                >
                  Agregar
                </Button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2" role="list" aria-label="Etiquetas de la persona">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      role="listitem"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        onKeyDown={(e) => {
                          if (e.key === 'Delete' || e.key === 'Backspace') {
                            handleRemoveTag(tag);
                          }
                        }}
                        className="hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
                        disabled={isLoading}
                        aria-label={`Eliminar etiqueta ${tag}`}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
