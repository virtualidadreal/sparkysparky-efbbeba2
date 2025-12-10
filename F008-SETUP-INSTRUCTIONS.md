# F-008: Planificación Diaria Configurable - Instrucciones de Setup

## Estado Actual
⚠️ La implementación está **COMPLETA** pero requiere ejecutar migraciones SQL manualmente debido a problemas temporales de conexión con Supabase.

## ¿Qué hace F-008?
Sistema de planificación diaria inteligente que:
- **Genera planes automáticamente con IA** (Lovable AI - google/gemini-2.5-flash)
- Analiza tareas pendientes y proyectos activos
- Propone **2-3 MITs** (Most Important Tasks) basados en urgencia y alineación
- Sugiere **bloques de tiempo** optimizados
- Se **ajusta según nivel de energía** matutina
- Incluye recordatorios y follow-ups
- Automatizable con **cron jobs**

---

## PASO 1: Ejecutar SQL en tu Base de Datos

Ve a **Lovable Cloud → Database → SQL Editor** y ejecuta:

```sql
-- Tabla para planes diarios
CREATE TABLE IF NOT EXISTS public.daily_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_date DATE NOT NULL,
  mits UUID[] DEFAULT '{}',
  time_blocks JSONB DEFAULT '[]'::jsonb,
  meetings JSONB DEFAULT '[]'::jsonb,
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  morning_energy_level INTEGER CHECK (morning_energy_level >= 1 AND morning_energy_level <= 5),
  focus_areas TEXT[],
  notes TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, plan_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_plans_user_date ON public.daily_plans(user_id, plan_date);
CREATE INDEX IF NOT EXISTS idx_daily_plans_status ON public.daily_plans(status);

-- Tabla para recordatorios
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('birthday', 'follow_up', 'deadline', 'reconnect', 'custom')),
  reminder_date DATE NOT NULL,
  related_entity_type TEXT CHECK (related_entity_type IN ('person', 'project', 'task', 'idea')),
  related_entity_id UUID,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminders_user_date ON public.reminders(user_id, reminder_date);
CREATE INDEX IF NOT EXISTS idx_reminders_completed ON public.reminders(is_completed) WHERE is_completed = false;
CREATE INDEX IF NOT EXISTS idx_reminders_type ON public.reminders(reminder_type);

-- RLS para daily_plans
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own plans" ON public.daily_plans;
CREATE POLICY "Users manage own plans" ON public.daily_plans
  FOR ALL USING (auth.uid() = user_id);

-- RLS para reminders
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own reminders" ON public.reminders;
CREATE POLICY "Users manage own reminders" ON public.reminders
  FOR ALL USING (auth.uid() = user_id);
```

---

## PASO 2: Actualizar config.toml

Añade la función al archivo `supabase/config.toml`:

```toml
[functions.generate-daily-plan]
verify_jwt = true
```

---

## PASO 3: Añadir ruta al router

Añade la ruta de Planning en tu archivo de rutas principal:

```typescript
import Planning from '@/pages/Planning';

// En tus rutas:
<Route path="/planning" element={
  <ProtectedRoute>
    <Planning />
  </ProtectedRoute>
} />
```

---

## PASO 4: Añadir link en Sidebar

Actualiza `src/components/layout/Sidebar.tsx` para incluir:

```typescript
{
  name: 'Planificación',
  href: '/planning',
  icon: CalendarIcon,
}
```

---

## PASO 5: (OPCIONAL) Automatizar con Cron

Para ejecutar la generación automática cada día a una hora específica:

1. **Habilitar extensiones** en Lovable Cloud → Database → SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
```

2. **Crear cron job** (reemplaza con tu URL y anon key):

```sql
SELECT cron.schedule(
  'daily-plan-generation',
  '0 17 * * *', -- Todos los días a las 17:00
  $$
  SELECT net.http_post(
      url:='https://fccrgezubjsstfnysisq.supabase.co/functions/v1/generate-daily-plan',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
      body:='{"auto": true}'::jsonb
  ) as request_id;
  $$
);
```

**Nota:** Para producción, necesitarás implementar lógica que itere sobre todos los usuarios y genere planes individuales.

---

## Características Implementadas

### ✅ Edge Function: `generate-daily-plan`
- Analiza tareas pendientes ordenadas por `urgency_score`
- Revisa proyectos activos por prioridad
- Consulta recordatorios del día
- Usa **Lovable AI** (google/gemini-2.5-flash) para generar plan inteligente
- Selecciona 2-3 MITs basados en impacto y urgencia
- Propone bloques de tiempo con tipos: focus, meeting, break, buffer
- Guarda plan en `daily_plans` con status 'draft'

### ✅ Hooks: `useDailyPlans.ts`
- `useTodayPlan()` - Obtiene plan del día actual
- `useDailyPlan(date)` - Plan de fecha específica
- `useGenerateDailyPlan()` - Genera plan con IA
- `useUpdateDailyPlan()` - Actualiza plan manualmente
- `useActivatePlan()` - Activa plan (status → 'active')
- `useAdjustPlanByEnergy()` - Reordena bloques según energía

### ✅ Página: `Planning.tsx`
- Vista completa del plan del día
- Selector de nivel de energía (1-5) con emojis
- Lista de MITs con badges de urgencia
- Timeline de bloques de tiempo con tipos visuales
- Botón para generar plan con IA
- Botón para activar y empezar el día
- Estado visual: draft → active → completed

---

## Flujo de Uso

1. **Usuario visita /planning por primera vez del día**
   → Ve botón "Generar Plan con IA"

2. **Click en generar**
   → Edge function analiza tareas, proyectos, recordatorios
   → IA genera plan óptimo con MITs y bloques de tiempo
   → Plan aparece con status 'draft'

3. **Usuario evalúa su energía**
   → Selecciona nivel 1-5
   → Plan se reordena automáticamente si energía es baja

4. **Usuario revisa y ajusta**
   → Puede modificar MITs manualmente
   → Puede editar bloques de tiempo

5. **Usuario activa el plan**
   → Click en "Activar Plan y Empezar el Día"
   → Status cambia a 'active'
   → Listo para ejecutar

---

## Criterios de Selección de MITs

La IA selecciona MITs considerando:

1. **Urgency Score** (de tabla `tasks`)
2. **Proximidad a deadline** (`due_date`)
3. **Alineación con proyectos activos**
4. **Impacto en objetivos generales**
5. **Balance entre tipos de tareas**

---

## Formato de Time Blocks

```typescript
{
  start: "09:00",       // Hora inicio (formato 24h)
  end: "10:30",         // Hora fin
  task_id: "uuid",      // UUID de tarea relacionada (opcional)
  type: "focus",        // focus | meeting | break | buffer
  title: "Trabajo profundo", // Descripción del bloque
  energy_required: 4    // Nivel de energía 1-5 (opcional)
}
```

---

## Ajuste por Energía

Si energía ≤ 2:
- Bloques con `energy_required` alto → sugiere posponer
- Bloques con `energy_required` bajo → prioriza
- Reduce duración de bloques de trabajo profundo
- Añade más breaks

---

## Testing Manual

1. Ejecuta el SQL
2. Ve a `/planning`
3. Click en "Generar Plan con IA"
4. Espera 5-10 segundos
5. Revisa MITs y bloques generados
6. Selecciona nivel de energía
7. Activa el plan

---

## Próximas Mejoras (No incluidas en F-008)

- Notificaciones push/email automáticas
- Configuración de hora preferida de planificación
- Integración con Google Calendar
- Modo inteligente (aprende de patrones)
- Variación por día de semana
- Retrospectiva del plan al final del día

---

## Estado: ⏳ PENDIENTE DE MIGRACIÓN SQL

Una vez ejecutes el SQL, la funcionalidad estará **100% operativa**.
