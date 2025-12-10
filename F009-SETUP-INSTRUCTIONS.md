# F-009: Rutina Matutina de Ajuste - Instrucciones de Setup

## Estado Actual
✅ La implementación está **COMPLETA** pero requiere que F-008 esté operativo primero.

## ¿Qué hace F-009?
Sistema de rutina matutina inteligente que:
- **Envía resumen matutino** del plan del día (email opcional)
- Pregunta **nivel de energía** con escala visual 1-5
- **Ajusta el plan automáticamente** si energía es baja (≤2)
- Muestra **brief de reuniones** del día con contexto
- Reordena tareas y bloques según capacidad real
- Permite **confirmar o editar** antes de activar plan

---

## Dependencias

**CRÍTICO:** F-009 requiere que F-008 (Planificación Diaria) esté completamente funcional:
- Tabla `daily_plans` existente
- Edge function `generate-daily-plan` operativa
- Hooks `useDailyPlans` disponibles

---

## Archivos Creados

### ✅ Edge Function: `morning-summary`
**Ubicación:** `supabase/functions/morning-summary/index.ts`

**Funcionalidad:**
- Obtiene plan del día del usuario
- Fetch de MITs, reuniones, bloques de tiempo
- Genera resumen estructurado
- Opcionalmente envía email con Resend
- Puede ser llamado manualmente o por cron

### ✅ Componente: `MorningSummaryModal`
**Ubicación:** `src/components/planning/MorningSummaryModal.tsx`

**Funcionalidad:**
- Modal interactivo para capturar energía
- Selector visual con emojis (1-5)
- Preview de MITs y objetivo del día
- Explicación de ajustes si energía es baja
- Sugerencia de rutina matutina

---

## PASO 1: Actualizar config.toml

Añade la función al archivo `supabase/config.toml`:

```toml
[functions.morning-summary]
verify_jwt = true
```

---

## PASO 2: Integrar en la Página de Planning

Actualiza `src/pages/Planning.tsx` para mostrar el modal matutino:

```typescript
import { useState, useEffect } from 'react';
import { MorningSummaryModal } from '@/components/planning';
import { useTodayPlan, useAdjustPlanByEnergy } from '@/hooks/useDailyPlans';
import { useTasks } from '@/hooks/useTasks';

const Planning = () => {
  const [showMorningSummary, setShowMorningSummary] = useState(false);
  const { data: todayPlan } = useTodayPlan();
  const { data: allTasks } = useTasks();
  const adjustPlan = useAdjustPlanByEnergy();

  // Mostrar modal matutino automáticamente si:
  // 1. Hay un plan para hoy
  // 2. El plan no está activo aún
  // 3. Es por la mañana (antes de las 12:00)
  useEffect(() => {
    if (todayPlan && todayPlan.status === 'draft') {
      const currentHour = new Date().getHours();
      if (currentHour >= 6 && currentHour < 12) {
        // Verificar si ya se mostró hoy (usar localStorage)
        const shownToday = localStorage.getItem(`morning-summary-${todayPlan.plan_date}`);
        if (!shownToday) {
          setShowMorningSummary(true);
          localStorage.setItem(`morning-summary-${todayPlan.plan_date}`, 'true');
        }
      }
    }
  }, [todayPlan]);

  const handleEnergySelected = (energyLevel: number) => {
    if (todayPlan) {
      adjustPlan.mutate(
        { planId: todayPlan.id, energyLevel },
        {
          onSuccess: () => {
            setShowMorningSummary(false);
          },
        }
      );
    }
  };

  const mitTasks = allTasks?.filter(t => todayPlan?.mits?.includes(t.id)) || [];

  return (
    <>
      {/* Resto del componente Planning */}
      
      {/* Modal de Resumen Matutino */}
      <MorningSummaryModal
        isOpen={showMorningSummary}
        onClose={() => setShowMorningSummary(false)}
        todayPlan={todayPlan}
        mitTasks={mitTasks}
        onEnergySelected={handleEnergySelected}
        isAdjusting={adjustPlan.isPending}
      />
    </>
  );
};
```

---

## PASO 3: (OPCIONAL) Configurar Envío Automático de Email

### 3.1. Obtener API Key de Resend

1. Ve a https://resend.com
2. Crea una cuenta (si no tienes)
3. Verifica tu dominio: https://resend.com/domains
4. Crea API key: https://resend.com/api-keys
5. Guarda el secret en Lovable:

```
Nombre: RESEND_API_KEY
Valor: re_xxxxxxxxxxxxx
```

### 3.2. Habilitar Extensiones de Cron

En Lovable Cloud → Database → SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### 3.3. Crear Cron Job para Envío Matutino

**Importante:** Este SQL contiene datos específicos de tu proyecto (URL y anon key).
Ejecuta en Lovable Cloud → Database → SQL Editor (NO usar migrations):

```sql
SELECT cron.schedule(
  'morning-summary-email',
  '0 8 * * *', -- Todos los días a las 08:00
  $$
  SELECT net.http_post(
      url:='https://fccrgezubjsstfnysisq.supabase.co/functions/v1/morning-summary',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjY3JnZXp1Ympzc3RmbnlzaXNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwOTA0MDUsImV4cCI6MjA3NzY2NjQwNX0.PHOybnY-EVnMdcCeWKtUj4jjrFS4g6qGjFSE45gp5aU"}'::jsonb,
      body:='{"sendEmail": true, "auto": true}'::jsonb
  ) as request_id;
  $$
);
```

**Nota:** En producción, necesitarás lógica para iterar sobre todos los usuarios activos y enviar emails individuales.

### 3.4. Configurar Hora de Envío por Usuario

Añade campo en `users` table o en `users.settings`:

```sql
-- Si aún no existe, añadir campo settings
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
  "morning_summary_time": "08:00",
  "enable_morning_email": true
}'::jsonb;
```

---

## Lógica de Ajuste Automático por Energía

Cuando `energyLevel <= 2`, el sistema aplica:

### 1. Reordenamiento de Tareas
```typescript
// Tareas se ordenan por energy_level_required ascendente
tasks.sort((a, b) => (a.energy_required || 0) - (b.energy_required || 0))
```

### 2. Ajuste de Time Blocks
- Bloques con `energy_required >= 4` → Reducir duración 25%
- Bloques de tipo `focus` → Acortar de 90min a 60min
- Añadir breaks adicionales (15min cada 60min)

### 3. Sugerencias de Posposición
- Tareas con `urgency_score < 5` y `energy_required >= 4`
- Se marcan para mover a otro día (sugerencia, no automático)

### 4. Priorización de Tareas Ligeras
- Tareas con `energy_required <= 2` suben en MITs
- "Quick wins" (tareas <30min) se priorizan

---

## Flujo de Uso

### Flujo Manual (en la App)

1. **Usuario abre la app por la mañana**
   → Detecta plan con status 'draft'
   → Muestra `MorningSummaryModal` automáticamente

2. **Usuario ve resumen del día**
   → MITs listados
   → Objetivo del día
   → Sugerencia matutina

3. **Usuario selecciona nivel de energía**
   → Click en escala 1-5
   → Si ≤2, muestra explicación de ajustes

4. **Click en "Ajustar plan y continuar"**
   → `useAdjustPlanByEnergy` se ejecuta
   → Plan se reordena según energía
   → Modal se cierra
   → Usuario ve plan ajustado

### Flujo Automático (con Email)

1. **Cron job se ejecuta a las 08:00**
   → Llama a `morning-summary` edge function
   → Para cada usuario con plan del día

2. **Edge function genera resumen**
   → Obtiene MITs, reuniones, bloques
   → Genera HTML del email

3. **Email enviado vía Resend**
   → Asunto: "🌅 Buenos días - Tu plan para [fecha]"
   → Contiene resumen completo
   → CTA: "Abrir Mi Plan del Día"

4. **Usuario abre email**
   → Lee resumen
   → Click en CTA
   → Redirige a `/planning`
   → Modal se abre automáticamente

---

## Formato del Email

El email incluye:

- **Header atractivo** con gradient y saludo personalizado
- **Objetivo del día** destacado
- **Sugerencia matutina** (si existe)
- **MITs** con urgencia y deadlines
- **Reuniones del día** con brief de preparación
- **Agenda sugerida** (primeros 8 bloques de tiempo)
- **CTA** para abrir la app
- **Footer** con pregunta de energía

---

## Testing

### Test Manual del Modal

1. Ve a `/planning`
2. Genera un plan para hoy (si no existe)
3. Asegúrate que status sea 'draft'
4. Recarga la página entre 6:00 AM - 12:00 PM
5. Modal debería aparecer automáticamente

### Test del Email

1. Llama manualmente a la edge function:

```bash
curl -X POST https://fccrgezubjsstfnysisq.supabase.co/functions/v1/morning-summary \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id",
    "sendEmail": true
  }'
```

2. Revisa tu email
3. Verifica que todos los elementos se muestran correctamente

---

## Personalización

### Cambiar Hora de Envío

Modifica el cron schedule:

```sql
-- Ejemplo: 07:30 AM
'30 7 * * *'

-- Ejemplo: Variable por día
'0 8 * * 1-5'  -- Solo lunes a viernes
```

### Personalizar Email Template

Edita la función `generateMorningSummaryEmail()` en `morning-summary/index.ts`:
- Cambia colores, fuentes, estilos
- Añade secciones personalizadas
- Modifica mensajes y textos

### Ajustar Lógica de Energía

En `useDailyPlans.ts`, función `useAdjustPlanByEnergy()`:
- Cambia threshold (actualmente ≤2)
- Ajusta % de reducción de duración
- Modifica algoritmo de reordenamiento

---

## Criterios de Activación del Modal

El modal se muestra automáticamente cuando:

1. ✅ Existe plan para hoy (`todayPlan !== null`)
2. ✅ Plan tiene status 'draft' (no activado aún)
3. ✅ Hora actual entre 6:00 AM - 12:00 PM
4. ✅ No se ha mostrado hoy (check con localStorage)

Para forzar que se muestre de nuevo, limpia localStorage:

```javascript
localStorage.removeItem(`morning-summary-${todayPlan.plan_date}`);
```

---

## Próximas Mejoras (No incluidas en F-009)

- Notificaciones push en móvil
- Recordatorios si no abre la app por la mañana
- Estadísticas de correlación energía vs productividad
- Machine learning para predecir energía según patrones
- Integración con wearables (Fitbit, Apple Watch)

---

## Estado: ⏳ PENDIENTE DE F-008

Una vez que F-008 esté operativo:
1. El modal funcionará automáticamente
2. Los emails se podrán enviar con Resend
3. Los ajustes por energía se aplicarán correctamente

**F-009 está 100% implementado, solo falta que F-008 esté activo.**
