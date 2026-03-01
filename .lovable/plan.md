

## Landing Page de Captacion de Leads - Manual Profesional ALCHEM

### Resumen

Crear una nueva ruta `/manual-profesional` con una landing page completa de captacion de leads, incluyendo formulario extenso, sistema de scoring, y entrega del PDF. Se requiere habilitar Lovable Cloud (Supabase) para almacenar leads, calcular scores y gestionar la entrega del PDF.

---

### Prerequisito: Habilitar Lovable Cloud

Se necesita backend para:
- Almacenar leads en base de datos (tabla `leads`)
- Almacenar el PDF en Supabase Storage (bucket privado)
- Edge function para calcular score, clasificar lead y generar enlace de descarga firmado
- (Futuro) Integracion con email marketing

**Accion requerida del usuario:** Habilitar Lovable Cloud desde el panel antes de implementar.

---

### Arquitectura de la Base de Datos

**Tabla: `leads`**

| Campo | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | Auto-generado |
| created_at | timestamptz | Fecha de registro |
| full_name | text | Nombre completo |
| email | text | Email profesional |
| phone | text | Telefono/WhatsApp |
| city | text | Ciudad |
| country | text | Pais |
| profession | text | Dropdown: Medico general, especialista, etc. |
| specialty | text | Campo abierto |
| practice_type | text | Dropdown: Clinica estetica, Medspa, etc. |
| clinic_name | text | Nombre de la clinica |
| role | text | Propietario/Socio/Empleado |
| patients_per_month | text | 0-50, 50-100, 100-300, 300+ |
| offers_peptides | boolean | Ofrece terapias con peptidos |
| uses_glp1 | boolean | Usa GLP-1/tirzepatida |
| interests | text[] | Array de areas de interes |
| main_intent | text | Intencion principal |
| consent | boolean | Acepta contacto |
| score | integer | Calculado automaticamente |
| classification | text | CALIENTE / TIBIO / FRIO |
| source_campaign | text | Fuente de campana |

---

### Sistema de Scoring (implementado en edge function)

```text
Tipo de practica:
  Clinica estetica / Medspa / Wellness: +3
  Consulta privada: +2
  Hospital / Distribuidor: +1
  Otro: 0

Rol:
  Propietario/Socio: +3
  Empleado: +1

Volumen pacientes:
  300+: +3 | 100-300: +2 | 50-100: +1 | 0-50: 0

Terapias actuales:
  Peptidos: +3 | GLP-1: +3 | Ambos: +5 | Ninguno: 0

Intencion:
  Implementar/Encontrar proveedores: +3
  Capacitacion/Escalar: +2
  Solo protocolos: +1

Intereses (max +3):
  +1 por NAD+ IV, Peptidos, GLP-1

Clasificacion:
  >= 12: CALIENTE
  6-11: TIBIO
  0-5: FRIO

Override CALIENTE:
  Propietario/Socio + (Encontrar proveedores | Implementar nuevos servicios)
```

---

### Estructura de Archivos a Crear/Modificar

1. **`src/pages/ManualProfesional.tsx`** - Landing page principal
2. **`src/pages/ManualConfirmacion.tsx`** - Pagina de confirmacion post-envio con enlace de descarga
3. **`src/components/leads/LeadCaptureHero.tsx`** - Hero de la landing (nombre del manual, valor $500 MXN, gratis)
4. **`src/components/leads/ManualContents.tsx`** - Seccion "Que incluye el manual"
5. **`src/components/leads/TargetAudience.tsx`** - Seccion "Para quien es"
6. **`src/components/leads/LeadForm.tsx`** - Formulario completo con todas las secciones
7. **`src/components/leads/LegalDisclaimer.tsx`** - Nota legal
8. **`src/data/lead-form-options.ts`** - Opciones de dropdowns, checkboxes, etc.
9. **`src/lib/lead-scoring.ts`** - Logica de scoring (cliente, para preview; el calculo real en edge function)
10. **`src/App.tsx`** - Agregar rutas `/manual-profesional` y `/manual-confirmacion`

**Backend (requiere Cloud):**
11. **Migracion SQL** - Tabla `leads`
12. **Supabase Storage** - Bucket `manuals` (privado) con el PDF
13. **Edge function `submit-lead`** - Recibe datos, calcula score, guarda en DB, genera URL firmada del PDF

---

### Diseno de la Landing Page

La pagina seguira el mismo design system del catalogo (Playfair Display + Inter, paleta teal/blanca) pero con enfoque en conversion:

**Seccion 1 - Hero:**
- Titulo: "Manual Profesional de Protocolos NAD+, Peptidos y Terapias Metabolicas"
- Subtitulo: beneficio profesional
- Badge: "Valor: $500 MXN - GRATIS para profesionales"
- Indicador: "Exclusivo para profesionales del sector salud"
- Mockup visual del manual (imagen)

**Seccion 2 - Que incluye (6 items con iconos):**
- Protocolos NAD+ IV
- Protocolos con peptidos (BPC-157, TB-500, GHK-Cu)
- Terapia con tirzepatida
- Dosis y ciclos clinicos
- Manejo de efectos secundarios
- Preparacion, reconstitucion y administracion

**Seccion 3 - Para quien es:**
- Lista con iconos de los perfiles profesionales

**Seccion 4 - Formulario (Card prominente):**
- Organizado en secciones con separadores visuales
- Validacion en tiempo real con zod + react-hook-form
- Validacion de email profesional (advertencia si gmail/hotmail sin empresa)
- Checkbox de consentimiento obligatorio
- Boton de envio prominente

**Seccion 5 - Nota legal:**
- Material de uso profesional
- No dirigido al publico general
- Informacion educativa
- Datos utilizados para comunicacion profesional

**Pagina de Confirmacion:**
- Mensaje de exito
- Boton de descarga directa del PDF
- Mensaje de que recibiran el enlace por correo
- CTA secundario hacia el catalogo de productos

---

### Detalles Tecnicos

**Validacion del formulario:**
- Schema zod con todos los campos obligatorios
- Email: regex para formato valido + warning visual si es gmail/hotmail sin clinic_name
- Telefono: formato internacional
- Consentimiento: must be true

**Flujo de envio (con Cloud):**
1. Usuario llena formulario y envia
2. Frontend valida con zod
3. Llama a edge function `submit-lead`
4. Edge function calcula score, clasifica, guarda en `leads`
5. Genera signed URL del PDF (1 hora de validez)
6. Retorna URL al frontend
7. Frontend redirige a `/manual-confirmacion` con la URL

**Flujo de envio (sin Cloud - fallback temporal):**
1. Frontend valida con zod
2. Calcula score localmente
3. Muestra pagina de confirmacion
4. CTA de WhatsApp para solicitar el manual
5. Datos se pierden (no hay backend)

---

### Secuencia de Implementacion

1. Crear archivo de opciones del formulario (`lead-form-options.ts`)
2. Crear logica de scoring (`lead-scoring.ts`)
3. Crear componentes de la landing (Hero, Contents, Audience, Form, Legal)
4. Crear paginas (ManualProfesional, ManualConfirmacion)
5. Agregar rutas en App.tsx
6. Copiar el PDF al proyecto como asset temporal
7. (Con Cloud) Crear tabla, bucket, edge function

**Nota:** La implementacion inicial funcionara sin backend - el formulario validara, calculara score localmente, y mostrara la confirmacion. Cuando se habilite Cloud, se conectara al backend completo.

