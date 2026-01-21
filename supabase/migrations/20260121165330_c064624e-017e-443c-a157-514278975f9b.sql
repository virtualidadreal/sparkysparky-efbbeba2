-- Insert sidebar visibility setting for admin control
INSERT INTO public.admin_settings (key, name, description, category, value)
VALUES (
  'sidebar_visibility',
  'Visibilidad del Sidebar',
  'Controla qué secciones del menú lateral están visibles para todos los usuarios',
  'navigation',
  '{
    "dashboard": true,
    "ideas": true,
    "projects": true,
    "tasks": true,
    "people": true,
    "diary": true,
    "memory": true,
    "analytics": true,
    "insights": true,
    "settings": true
  }'::jsonb
)
ON CONFLICT (key) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category;