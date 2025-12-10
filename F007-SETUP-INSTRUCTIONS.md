# F-007: Modo Crítico Constructivo - Instrucciones de Setup

## Estado Actual
⚠️ La implementación está **COMPLETA** pero requiere ejecutar migraciones SQL manualmente debido a problemas temporales de conexión con Supabase.

## ¿Qué hace F-007?
Sistema de crítica constructiva que:
- Calcula **DisagreeScore** automáticamente (fórmula del PRD)
- Analiza decisiones usando marco **CRIT-R** (Claridad, Relevancia, Impacto, Trade-offs, Riesgos)
- Genera críticas con IA (Lovable AI - google/gemini-2.5-flash)
- Presenta **alternativas concretas** siempre
- Respeta safe-words del usuario
- 4 niveles de asertividad configurables

---

## PASO 1: Ejecutar SQL en tu Base de Datos

Ve a **Lovable Cloud → Database → SQL Editor** y ejecuta:

```sql
-- Tabla para interacciones con Sparky (incluyendo críticas)
CREATE TABLE IF NOT EXISTS public.sparky_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('capture', 'question', 'critique', 'reflection', 'planning')),
  content TEXT NOT NULL,
  was_critique BOOLEAN DEFAULT false,
  disagree_score INTEGER CHECK (disagree_score >= 0 AND disagree_score <= 17),
  critique_reasoning TEXT,
  user_accepted BOOLEAN,
  user_response TEXT,
  context_data JSONB DEFAULT '{}'::jsonb,
  related_entity_type TEXT CHECK (related_entity_type IN ('idea', 'project', 'task', 'diary', 'person', 'value')),
  related_entity_id UUID,
  session_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sparky_interactions_user_id ON public.sparky_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_sparky_interactions_session ON public.sparky_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_sparky_interactions_critique ON public.sparky_interactions(was_critique) WHERE was_critique = true;

ALTER TABLE public.sparky_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own interactions" ON public.sparky_interactions;
CREATE POLICY "Users manage own interactions" ON public.sparky_interactions
  FOR ALL USING (auth.uid() = user_id);

-- Tabla para rastrear valores del usuario
CREATE TABLE IF NOT EXISTS public.values_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  value_name TEXT NOT NULL,
  value_description TEXT,
  importance_level INTEGER DEFAULT 5 CHECK (importance_level >= 1 AND importance_level <= 5),
  last_alignment_check TIMESTAMPTZ,
  alignment_score INTEGER CHECK (alignment_score >= 1 AND alignment_score <= 10),
  drift_alerts_count INTEGER DEFAULT 0,
  related_actions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, value_name)
);

CREATE INDEX IF NOT EXISTS idx_values_tracking_user_id ON public.values_tracking(user_id);

ALTER TABLE public.values_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own values" ON public.values_tracking;
CREATE POLICY "Users manage own values" ON public.values_tracking
  FOR ALL USING (auth.uid() = user_id);
```

---

## PASO 2: Restaurar el Código

Una vez ejecutado el SQL, dime **"SQL ejecutado"** y restauraré:

1. ✅ **Edge Function**: `supabase/functions/analyze-critique/index.ts`
   - Calcula DisagreeScore
   - Analiza con Lovable AI (google/gemini-2.5-flash)
   - Genera críticas con marco CRIT-R
   - Respeta configuración de usuario

2. ✅ **Hook**: `src/hooks/useCritique.ts`
   - `useAnalyzeCritique()` - Analiza si se requiere crítica
   - `useRecentCritiques()` - Obtiene historial
   - `useRespondToCritique()` - Guarda respuesta del usuario

3. ✅ **Componente UI**: `src/components/critique/CritiqueModal.tsx`
   - Modal con crítica completa
   - Barra visual de DisagreeScore
   - Desglose de factores
   - Botones: Aceptar / Rechazar
   - Opcional: añadir comentario

---

## PASO 3: Actualizar config.toml

Añade la función al archivo `supabase/config.toml`:

```toml
[functions.analyze-critique]
verify_jwt = true
```

---

## Criterios de Activación de Crítica

Según PRD, la crítica se activa automáticamente cuando:

**DisagreeScore ≥ 8**

Fórmula:
```
DisagreeScore = (Impacto × Incertidumbre) + Incoherencia + PatrónNegativo + DesviaciónValores

Donde:
- Impacto: 1-5
- Incertidumbre: 1-5
- Incoherencia: 0 o 3
- PatrónNegativo: 0 o 2
- DesviaciónValores: 0 o 3

Máximo posible: 17 puntos
```

---

## Niveles de Asertividad

El usuario puede configurar en `users.settings.assertiveness_level`:

1. **Suave** - Diplomático y gentil
2. **Media** - Directo pero amable (default)
3. **Firme** - Claro y sin rodeos
4. **Duro-cariñoso** - Como un buen amigo que te dice la verdad

---

## Integración Sugerida

Una vez funcional, integrar con:

- **Ideas**: Analizar antes de guardar
- **Proyectos**: Validar antes de crear/actualizar
- **Tareas**: Revisar priorización
- **Diario**: Detectar patrones negativos

---

## Testing

Para probar después de restaurar:

```typescript
const { mutate: analyzeCritique } = useAnalyzeCritique();

analyzeCritique({
  content: "Voy a empezar 3 proyectos nuevos esta semana",
  entityType: 'idea',
  entityId: 'test-id',
  context: {
    userValues: ['foco', 'calidad sobre cantidad']
  }
});
```

---

## Estado: ⏳ PENDIENTE DE MIGRACIÓN SQL

Una vez ejecutes el SQL, avísame para restaurar el código completo.
