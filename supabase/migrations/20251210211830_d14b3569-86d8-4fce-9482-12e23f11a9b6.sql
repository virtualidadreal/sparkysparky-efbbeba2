-- Añadir project_id a ideas para vincularlas automáticamente
ALTER TABLE public.ideas 
ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

-- Añadir tags a proyectos para poder hacer matching automático
ALTER TABLE public.projects 
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Añadir keywords a proyectos para matching por palabras clave
ALTER TABLE public.projects 
ADD COLUMN keywords TEXT[] DEFAULT '{}';

-- Crear índice para búsqueda eficiente de tags en ideas
CREATE INDEX IF NOT EXISTS idx_ideas_tags ON public.ideas USING GIN(tags);

-- Crear índice para búsqueda eficiente de tags en proyectos
CREATE INDEX IF NOT EXISTS idx_projects_tags ON public.projects USING GIN(tags);

-- Crear índice para project_id en ideas
CREATE INDEX IF NOT EXISTS idx_ideas_project_id ON public.ideas(project_id);