# Stack Tecnológico y Arquitectura de la Aplicación
# Finanzas Personales — Documento Técnico de Implementación
**Versión:** 1.0  
**Complementa:** `ARQUITECTURA_LOGICA_NEGOCIO.md`  
**Clasificación:** Decisiones Técnicas — Documento de Referencia Permanente  
**Audiencia:** Desarrolladores Senior, Tech Leads  
**Fecha:** Marzo 2026

---

## TABLA DE CONTENIDOS

1. Decisión de Arquitectura de Aplicación
2. Stack Tecnológico Seleccionado
3. Justificación de Cada Tecnología
4. Arquitectura de Carpetas y Módulos
5. Diseño de la Capa de Datos
6. Diseño de la API Interna (tRPC)
7. Gestión de Estado en el Cliente
8. Principios Técnicos de la Aplicación
9. Estrategia de Autenticación Técnica
10. Estrategia de Testing
11. Estrategia de Despliegue

---

# 1. DECISIÓN DE ARQUITECTURA DE APLICACIÓN

## 1.1 Full-Stack Monolito Modular — Por qué no un backend separado

Dado el modelo de dominio definido en el documento de lógica de negocio, la decisión más adecuada para esta aplicación es una **arquitectura full-stack en un único proyecto**, sin separación de repositorios frontend/backend.

**Razones fundamentales:**

**a) El dominio no justifica la complejidad de servicios separados:**  
La aplicación es mono-usuario en su concepción actual. Un backend separado introduciría overhead de infraestructura (dos servicios deployados, CORS, autenticación cruzada, dos pipelines de CI/CD) sin ningún beneficio real en esta etapa.

**b) Consistencia de tipos de punta a punta:**  
Con un único proyecto TypeScript, los tipos del dominio (entidades, DTOs, respuestas de API) se comparten directamente entre el servidor y el cliente sin necesidad de generación de código ni contratos OpenAPI. Esto es crítico en un sistema financiero donde los tipos de datos (precisión decimal, enumeraciones de estado) deben ser exactamente los mismos en ambos extremos.

**c) Colocación de lógica de negocio con infraestructura segura:**  
Las reglas de negocio financiero y el acceso a la base de datos nunca abandonan el servidor. No existe el riesgo de exponer lógica financiera en el bundle del cliente.

**d) Camino de evolución limpio:**  
La arquitectura modular interna garantiza que si en el futuro se necesita extraer el backend como microservicio independiente (para integraciones bancarias de alto volumen, por ejemplo), los módulos de dominio pueden migrarse sin reescritura.

**Arquitectura elegida: Next.js Full-Stack (App Router) + tRPC**

---

# 2. STACK TECNOLÓGICO SELECCIONADO

## Resumen Visual del Stack

```
┌─────────────────────────────────────────────────────┐
│                   CLIENTE (Browser)                  │
│  Next.js App Router · React 19 · TypeScript          │
│  TanStack Query · Zustand · Tailwind CSS             │
└─────────────────────┬───────────────────────────────┘
                      │ tRPC (type-safe RPC)
┌─────────────────────▼───────────────────────────────┐
│                   SERVIDOR (Next.js)                  │
│  Route Handlers · tRPC Router · Auth.js v5            │
│  Casos de Uso (Capa de Aplicación)                   │
│  Dominio (Entidades, Agregados, Reglas)               │
└─────────────────────┬───────────────────────────────┘
                      │ Prisma ORM
┌─────────────────────▼───────────────────────────────┐
│                   BASE DE DATOS                       │
│  PostgreSQL (Neon — Serverless)                      │
└─────────────────────────────────────────────────────┘
```

## Stack Completo

| Capa | Tecnología | Versión Target |
|---|---|---|
| **Framework Principal** | Next.js (App Router) | 15.x |
| **Lenguaje** | TypeScript | 5.x (strict mode) |
| **API Layer** | tRPC | v11 |
| **Base de Datos** | PostgreSQL | 16.x |
| **Proveedor BD** | Neon (Serverless Postgres) | Última |
| **ORM** | Prisma | 6.x |
| **Autenticación** | Auth.js (NextAuth) | v5 |
| **Validación** | Zod | 3.x |
| **Estado Servidor** | TanStack Query | v5 |
| **Estado Cliente** | Zustand | v5 |
| **Estilos** | Tailwind CSS | v4 |
| **Componentes UI** | shadcn/ui | Última |
| **Iconos** | Lucide React | Última |
| **Gráficas** | Recharts | 2.x |
| **Testing Unitario** | Vitest | Última |
| **Testing E2E** | Playwright | Última |
| **Calidad de Código** | ESLint + Prettier | Última |
| **Despliegue** | Vercel | — |

---

# 3. JUSTIFICACIÓN DE CADA TECNOLOGÍA

## 3.1 Next.js 15 con App Router

**Por qué:** Next.js es la elección canónica para aplicaciones React de producción en 2025-2026. El App Router introduce React Server Components, que son ideales para una aplicación financiera:

- **React Server Components para vistas de datos:** Los dashboards, historial de transacciones y reportes se renderizan en el servidor. El HTML llega al cliente con datos ya incluidos — sin loading spinners en la primera carga, sin exponer la lógica de consulta al cliente.
- **Route Handlers como API:** Los endpoints del backend son Route Handlers dentro del mismo proyecto. No existe un servidor Express/Fastify separado que mantener.
- **Server Actions:** Las mutaciones (registrar ingreso, crear sección de ahorro) se ejecutan como Server Actions, eliminando la necesidad de endpoints PUT/POST explícitos para operaciones simples.
- **Middleware de autenticación:** El middleware de Next.js protege rutas completas antes de que el request llegue a los componentes.

## 3.2 TypeScript en Modo Strict

**Por qué:** En un sistema financiero, un error de tipo es un error financiero potencial. TypeScript en modo `strict` activa:
- `strictNullChecks`: Un `Money` nunca puede ser `undefined` sin manejo explícito.
- `noImplicitAny`: Todo parámetro financiero tiene tipo explícito.
- `strictFunctionTypes`: Las funciones de cálculo de balance tienen firmas exactas.

El compilador actúa como primera línea de defensa contra errores de dominio.

## 3.3 tRPC v11

**Por qué:** tRPC es la solución más elegante para el problema de comunicación cliente-servidor en un stack TypeScript monorepo. Elimina completamente la necesidad de definir contratos de API (REST o GraphQL) manualmente.

- El procedimiento `income.register` definido en el servidor está **automáticamente tipado** en el cliente. Si cambia el tipo de retorno en el servidor, el cliente tiene error de compilación.
- Integra nativamente con TanStack Query para caché, reintentos y estados de carga.
- Integra con Zod para validación automática de inputs en cada procedimiento — las validaciones del dominio tienen una primera capa de defensa en el borde de la API.
- No genera código (a diferencia de GraphQL codegen): los tipos son inferidos en tiempo real.

**Alternativa descartada — REST:** REST requiere documentación manual (OpenAPI), generación de cliente, y sincronización manual de tipos. Para un monorepo TypeScript, tRPC es superior en DX y seguridad de tipos.

**Alternativa descartada — GraphQL:** GraphQL introduce complejidad de schema, resolvers y codegen injustificada para una aplicación de un solo usuario. Su ventaja (queries flexibles del cliente) no aplica aquí porque el cliente está controlado.

## 3.4 PostgreSQL + Neon

**Por qué PostgreSQL:**  
PostgreSQL es la única opción seria para datos financieros:
- **ACID completo:** Las transacciones financieras multi-tabla se ejecutan con garantías de atomicidad, consistencia, aislamiento y durabilidad.
- **Tipos numéricos exactos:** El tipo `NUMERIC(19, 4)` almacena montos financieros sin pérdida de precisión (a diferencia de `FLOAT` que usa punto flotante binario y introduce errores de redondeo).
- **Capacidades avanzadas de query:** Las consultas de balance histórico, agrupaciones por período, y joins entre transacciones y secciones de ahorro aprovechan el poder expresivo de SQL estándar.
- **Transacciones serializables:** Garantizan que dos operaciones concurrentes no produzcan un estado inconsistente.
- **Append-only natural:** El modelo de log de transacciones del dominio se mapea directamente a una tabla con `INSERT` únicos y sin `UPDATE/DELETE`.

**Por qué Neon (Serverless Postgres):**  
- PostgreSQL 100% compatible — no hay vendor lock-in a nivel de SQL.
- Escalado automático a cero cuando no hay uso (ideal para fase inicial sin costo fijo).
- Ramificación de base de datos (branching) para entornos de desarrollo/preview sin duplicar infraestructura.
- Integración nativa con Vercel.

**Alternativa descartada — MongoDB/NoSQL:**  
Un modelo financiero basado en transacciones append-only, con relaciones entre usuario → transacciones → secciones de ahorro, se beneficia enormemente de la consistencia relacional y las foreign keys. NoSQL implicaría implementar manualmente las garantías que PostgreSQL provee por defecto.

**Alternativa descartada — SQLite:**  
SQLite es excelente para aplicaciones de escritorio o prototipos, pero no soporta concurrencia de escritura adecuada ni es viable para despliegue serverless con múltiples instancias.

## 3.5 Prisma ORM

**Por qué:**
- **Type-safety total:** El cliente Prisma generado desde el schema refleja exactamente la estructura de la base de datos con tipos TypeScript precisos.
- **Migrations declarativas:** Los cambios al schema de la base de datos se versionan como archivos de migración, permitiendo evolucionar la estructura de datos con historia trazable.
- **Prisma Schema Language:** El schema es la fuente de verdad única entre la base de datos y los tipos de TypeScript del servidor — alineado con el principio de Single Source of Truth del documento de dominio.
- **Soporte de transacciones:** Las operaciones multi-tabla (registrar transacción + actualizar snapshot) usan `prisma.$transaction()` con garantías ACID.

## 3.6 Auth.js v5 (NextAuth)

**Por qué:**
- Diseñado específicamente para Next.js con soporte nativo del App Router.
- Manejo transparente de JWT y sesiones con adaptador para Prisma (las sesiones se persisten en PostgreSQL).
- Soporte de múltiples proveedores: credenciales (email/contraseña), OAuth (Google, GitHub) con el mismo sistema.
- El middleware de Next.js se integra directamente con Auth.js para proteger rutas a nivel de edge.
- Implementa las mejores prácticas de seguridad (rotación de tokens, CSRF protection, cookies seguras) sin configuración manual.

## 3.7 Zod

**Por qué:**
- Los schemas de Zod son la única definición necesaria para validar inputs del usuario — tRPC los usa automáticamente como validación de procedimientos y para inferir los tipos TypeScript de los inputs.
- Un schema Zod para `RegisterIncomeInput` valida monto, fecha, categoría y moneda en el borde de la API, antes de que el caso de uso de dominio se ejecute.
- Permite definir validaciones financieras reutilizables: `z.number().positive()` para montos, `z.string().regex(/^[A-Z]{3}$/)` para códigos ISO 4217 de moneda.

## 3.8 TanStack Query v5

**Por qué:** En el cliente, los datos financieros (balance, historial de transacciones, estado de secciones de ahorro) son datos del servidor que necesitan:
- **Caché inteligente:** El historial del mes anterior no cambia; puede ser cacheado agresivamente. El balance del mes activo invalida su caché cuando hay una nueva transacción.
- **Refetch automático:** Después de registrar un egreso, el balance se actualiza automáticamente sin recargar la página.
- **Estados de carga y error:** UI consistente para loading/error/success sin boilerplate.
- **Optimistic updates:** Al registrar un ingreso, el balance se actualiza inmediatamente en la UI mientras la petición al servidor se completa en background — experiencia fluida sin esperas.

## 3.9 Zustand v5

**Por qué:**  
Estado global del cliente minimalista para:
- Preferencias de UI (período activo seleccionado, filtros activos, vista de dashboard).
- Estado de formularios complejos multi-paso (registro de ingreso extraordinario con varios campos).
- Notificaciones y alertas del sistema.

Zustand es preferible a Redux por su simplicidad extrema y a React Context por su rendimiento (no re-renderiza componentes que no consumen el slice de estado modificado).

## 3.10 Tailwind CSS v4 + shadcn/ui

**Por qué Tailwind v4:**  
La versión 4 de Tailwind introduce un motor CSS-first sin archivo de configuración JavaScript, compilación en tiempo real con Lightning CSS, y mejor rendimiento general. Es el estándar de facto para styling en proyectos Next.js modernos.

**Por qué shadcn/ui:**  
shadcn/ui no es una librería de componentes instalada como dependencia — es una colección de componentes que se copian directamente al proyecto y son completamente modificables. Esto significa:
- Control total sobre el markup y estilos de cada componente.
- Los componentes financieros (tablas de transacciones, formularios de registro, cards de saldo) pueden adaptarse exactamente al diseño sin luchar contra abstracciones de la librería.
- Accesibilidad integrada (Radix UI como base).

---

# 4. ARQUITECTURA DE CARPETAS Y MÓDULOS

La estructura de carpetas refleja directamente la arquitectura en capas del documento de dominio, usando el App Router de Next.js.

```
finanzas/
├── src/
│   ├── app/                          # Capa de Presentación (Next.js App Router)
│   │   ├── (auth)/                   # Grupo de rutas — autenticación
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/              # Grupo de rutas — app protegida
│   │   │   ├── layout.tsx            # Layout con sidebar y nav
│   │   │   ├── page.tsx              # Dashboard principal
│   │   │   ├── transactions/         # Historial de movimientos
│   │   │   ├── income/               # Registro de ingresos
│   │   │   ├── expenses/             # Registro de egresos
│   │   │   ├── savings/              # Secciones de ahorro
│   │   │   └── extraordinary/        # Ingresos extraordinarios
│   │   ├── api/
│   │   │   ├── trpc/[trpc]/          # tRPC handler
│   │   │   │   └── route.ts
│   │   │   └── auth/[...nextauth]/   # Auth.js handler
│   │   │       └── route.ts
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css
│   │
│   ├── server/                       # Código exclusivo del servidor
│   │   ├── domain/                   # Capa de Dominio
│   │   │   ├── entities/
│   │   │   │   ├── financial-transaction.ts
│   │   │   │   ├── savings-section.ts
│   │   │   │   └── extraordinary-income.ts
│   │   │   ├── value-objects/
│   │   │   │   ├── money.ts
│   │   │   │   ├── period.ts
│   │   │   │   ├── percentage.ts
│   │   │   │   └── savings-strategy.ts
│   │   │   ├── events/
│   │   │   │   └── domain-events.ts
│   │   │   └── services/
│   │   │       ├── balance-calculator.ts
│   │   │       └── savings-calculator.ts
│   │   │
│   │   ├── application/              # Capa de Aplicación (Casos de Uso)
│   │   │   ├── income/
│   │   │   │   ├── register-income.usecase.ts
│   │   │   │   └── get-income-history.usecase.ts
│   │   │   ├── expenses/
│   │   │   │   ├── register-expense.usecase.ts
│   │   │   │   └── cancel-transaction.usecase.ts
│   │   │   ├── savings/
│   │   │   │   ├── create-savings-section.usecase.ts
│   │   │   │   ├── deposit-to-savings.usecase.ts
│   │   │   │   └── dissolve-savings-section.usecase.ts
│   │   │   ├── extraordinary/
│   │   │   │   └── register-extraordinary-income.usecase.ts
│   │   │   └── balance/
│   │   │       └── get-period-balance.usecase.ts
│   │   │
│   │   ├── infrastructure/           # Capa de Infraestructura
│   │   │   ├── db/
│   │   │   │   ├── prisma.ts         # Singleton del cliente Prisma
│   │   │   │   └── repositories/
│   │   │   │       ├── transaction.repository.ts
│   │   │   │       ├── savings.repository.ts
│   │   │   │       └── user.repository.ts
│   │   │   └── audit/
│   │   │       └── audit-log.service.ts
│   │   │
│   │   └── api/                      # Capa de API (tRPC Routers)
│   │       ├── root.ts               # Router raíz que combina todos
│   │       ├── trpc.ts               # Configuración base de tRPC
│   │       └── routers/
│   │           ├── income.router.ts
│   │           ├── expense.router.ts
│   │           ├── savings.router.ts
│   │           ├── extraordinary.router.ts
│   │           └── balance.router.ts
│   │
│   ├── shared/                       # Código compartido cliente/servidor
│   │   ├── types/                    # Tipos TypeScript compartidos
│   │   ├── schemas/                  # Schemas Zod reutilizables
│   │   │   ├── money.schema.ts
│   │   │   ├── period.schema.ts
│   │   │   └── transaction.schema.ts
│   │   └── constants/
│   │       ├── categories.ts
│   │       └── currencies.ts
│   │
│   └── components/                   # Componentes React del cliente
│       ├── ui/                       # shadcn/ui base components
│       ├── finance/                  # Componentes del dominio financiero
│       │   ├── balance-card.tsx
│       │   ├── transaction-list.tsx
│       │   ├── savings-card.tsx
│       │   └── cashflow-chart.tsx
│       └── forms/                    # Formularios de registro
│           ├── income-form.tsx
│           ├── expense-form.tsx
│           └── savings-form.tsx
│
├── prisma/
│   ├── schema.prisma                 # Schema de la base de datos
│   └── migrations/                   # Historial de migraciones
│
├── tests/
│   ├── unit/                         # Tests unitarios del dominio
│   └── e2e/                          # Tests end-to-end (Playwright)
│
├── public/
├── .env.local                        # Variables de entorno locales
├── next.config.ts
├── tsconfig.json                     # TypeScript strict mode
└── package.json
```

---

# 5. DISEÑO DE LA CAPA DE DATOS

## 5.1 Schema de Prisma (Descripción Estructural)

El schema refleja directamente el modelo de dominio definido en `ARQUITECTURA_LOGICA_NEGOCIO.md`.

### Tabla: `User`
Representa al usuario titular de la cuenta financiera.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único inmutable (CUID2) |
| `email` | String (único) | Identificador de autenticación |
| `name` | String | Nombre para personalización |
| `baseCurrency` | String (ISO 4217) | Moneda base por defecto: "COP" |
| `createdAt` | DateTime | Fecha de registro |
| `status` | Enum | ACTIVE, SUSPENDED, DELETED |

### Tabla: `FinancialTransaction`
Log de movimientos financieros — append-only.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `userId` | UUID (FK) | Propietario del movimiento |
| `type` | Enum | INCOME, EXPENSE |
| `subtype` | Enum | ORDINARY, EXTRAORDINARY |
| `amount` | Decimal(19,4) | Monto con precisión financiera |
| `currency` | String (ISO 4217) | Moneda del movimiento |
| `categoryId` | UUID (FK) | Categoría del movimiento |
| `description` | String | Descripción libre |
| `occurredAt` | DateTime | Fecha real del movimiento |
| `registeredAt` | DateTime | Fecha de ingreso al sistema |
| `status` | Enum | PENDING, CONFIRMED, CANCELLED |
| `correlationId` | UUID | Vincula movimiento original con compensatorio |
| `idempotencyKey` | String (único) | Previene duplicados |
| `ruleEngineVersion` | String | Versión de reglas aplicadas |

### Tabla: `SavingsSection`
Secciones de ahorro con propósito específico.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `userId` | UUID (FK) | Propietario |
| `name` | String | Nombre de la sección |
| `strategyType` | Enum | FIXED, PERCENTAGE, GOAL |
| `fixedAmount` | Decimal(19,4) | Para estrategia FIXED |
| `percentage` | Decimal(5,4) | Para estrategia PERCENTAGE |
| `goalAmount` | Decimal(19,4) | Para estrategia GOAL |
| `goalDate` | DateTime? | Fecha objetivo (GOAL) |
| `currentBalance` | Decimal(19,4) | Saldo acumulado actual |
| `status` | Enum | ACTIVE, PAUSED, COMPLETED, DISSOLVED |
| `createdAt` | DateTime | Fecha de creación |

### Tabla: `ExtraordinaryIncome`
Registro específico de ingresos no recurrentes.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `userId` | UUID (FK) | Propietario |
| `transactionId` | UUID (FK) | Movimiento asociado |
| `extraType` | Enum | PRIMA, CESANTIAS_INTEREST, BONUS, OTHER |
| `grossAmount` | Decimal(19,4) | Monto bruto |
| `netAmount` | Decimal(19,4) | Monto después de retenciones |
| `fiscalPeriod` | String | Período fiscal (ej: "2025-H1") |
| `isTaxExempt` | Boolean | Exento de retención |
| `source` | String | Descripción del origen |

### Tabla: `BalanceSnapshot`
Snapshots periódicos para optimización de consultas.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `userId` | UUID (FK) | Propietario |
| `periodEnd` | DateTime | Fecha de cierre del snapshot |
| `accumulatedBalance` | Decimal(19,4) | Balance hasta esa fecha |
| `totalIncome` | Decimal(19,4) | Total ingresos acumulados |
| `totalExpenses` | Decimal(19,4) | Total egresos acumulados |

### Tabla: `AuditLog`
Log financiero de auditoría — absolutamente write-only desde la aplicación.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `userId` | UUID | Usuario que realizó la acción |
| `sessionId` | String | Sesión de la acción |
| `action` | String | Descripción de la operación |
| `entityType` | String | Tipo de entidad afectada |
| `entityId` | UUID | ID de la entidad afectada |
| `before` | JSON? | Estado anterior (para cambios) |
| `after` | JSON? | Estado posterior |
| `ipAddress` | String | IP de origen |
| `userAgent` | String | Browser/cliente |
| `timestamp` | DateTime | Marca temporal UTC en milisegundo |

---

# 6. DISEÑO DE LA API INTERNA (tRPC)

## 6.1 Estructura de Routers

Cada router de tRPC corresponde a un Bounded Context del dominio. Los procedimientos se dividen en **queries** (solo lectura) y **mutations** (escritura con efectos de dominio).

### Router: `income`

| Procedimiento | Tipo | Descripción |
|---|---|---|
| `income.register` | mutation | Registra un ingreso ordinario |
| `income.getHistory` | query | Lista ingresos con filtros de período y categoría |
| `income.cancel` | mutation | Anula un ingreso mediante compensación |
| `income.getPeriodSummary` | query | Resumen de ingresos del período activo |

### Router: `expense`

| Procedimiento | Tipo | Descripción |
|---|---|---|
| `expense.register` | mutation | Registra un egreso |
| `expense.getHistory` | query | Lista egresos con filtros |
| `expense.cancel` | mutation | Anula un egreso mediante compensación |
| `expense.getByCategory` | query | Egresos agrupados por categoría en un período |

### Router: `savings`

| Procedimiento | Tipo | Descripción |
|---|---|---|
| `savings.createSection` | mutation | Crea una nueva sección de ahorro |
| `savings.deposit` | mutation | Aporta a una sección de ahorro |
| `savings.withdraw` | mutation | Retira parcialmente de una sección |
| `savings.pause` | mutation | Pausa una sección activa |
| `savings.dissolve` | mutation | Disuelve una sección y libera el saldo |
| `savings.getAll` | query | Lista todas las secciones del usuario |
| `savings.getById` | query | Detalle de una sección con historial |

### Router: `extraordinary`

| Procedimiento | Tipo | Descripción |
|---|---|---|
| `extraordinary.registerPrima` | mutation | Registra una prima |
| `extraordinary.registerCesantias` | mutation | Registra intereses de cesantías |
| `extraordinary.registerBonus` | mutation | Registra una bonificación |
| `extraordinary.registerOther` | mutation | Registra otro ingreso extraordinario |
| `extraordinary.getHistory` | query | Historial de ingresos extraordinarios |
| `extraordinary.getPeriodTotal` | query | Total extraordinario por período |

### Router: `balance`

| Procedimiento | Tipo | Descripción |
|---|---|---|
| `balance.getPeriod` | query | Balance del período (FCO, FCT, FCL) |
| `balance.getAccumulated` | query | Balance acumulado histórico |
| `balance.getNetWorth` | query | Patrimonio neto calculado |
| `balance.getCashflow` | query | Flujo de caja por período (para gráficas) |

## 6.2 Middleware de tRPC

Cada procedimiento que opera sobre datos financieros pasa por un middleware `enforceUserOwnership` que verifica:
1. La sesión es válida (el token de Auth.js está presente y no ha expirado).
2. El `userId` de la sesión coincide con el `userId` propietario del recurso solicitado.
3. La cuenta del usuario está en estado `ACTIVE`.

Este middleware es la implementación técnica de la **Regla de Autorización Universal** definida en el documento de lógica de negocio.

---

# 7. GESTIÓN DE ESTADO EN EL CLIENTE

## 7.1 División de Responsabilidades de Estado

La gestión de estado en el cliente se divide en dos categorías bien diferenciadas:

**Estado del Servidor (TanStack Query + tRPC):**  
Todo dato que proviene del servidor y refleja el estado financiero real:
- Balance del período activo
- Lista de transacciones
- Estado de secciones de ahorro
- Resúmenes y totales

TanStack Query cachea estos datos, los invalida automáticamente cuando hay mutaciones, y gestiona los estados de carga y error. No existe un store de Redux/Zustand con datos financieros — esos datos viven en el caché de TanStack Query y son la proyección del estado del servidor.

**Estado del Cliente (Zustand):**  
Estado de UI que no necesita persistencia en servidor:
- Período activo seleccionado (mes/año que el usuario está viendo)
- Filtros activos en la lista de transacciones
- Estado de sidebars, modales y drawers
- Notificaciones temporales (toasts)
- Configuración de visualización (modo compacto, orden de columnas)

## 7.2 Estrategia de Invalidación de Caché

Cuando el usuario registra un nuevo ingreso, la respuesta del servidor dispara la invalidación automática de:
- `balance.getPeriod` del período correspondiente
- `income.getHistory` del período correspondiente
- `balance.getAccumulated`

Esto garantiza que el dashboard refleja el estado real sin necesidad de recargar la página, mientras se evita refetch innecesario de datos que no cambiaron.

## 7.3 Optimistic Updates

Para operaciones frecuentes (registrar egreso de consumo diario), se implementan optimistic updates:
1. La UI actualiza el balance y la lista de transacciones inmediatamente.
2. La petición al servidor se envía en background.
3. Si el servidor confirma, el estado optimista se valida.
4. Si el servidor rechaza, el estado optimista se revierte y se muestra el error.

Esto hace que la aplicación se sienta instantánea para el usuario a pesar de la latencia de red.

---

# 8. PRINCIPIOS TÉCNICOS DE LA APLICACIÓN

## 8.1 Server-First: Los Datos Financieros No Se Procesan en el Cliente

**Principio:** La lógica de cálculo financiero (balance, flujo de caja, patrimonio neto) se ejecuta exclusivamente en el servidor. El cliente solo recibe resultados ya calculados y los renderiza.

**Implicación práctica:** No existen funciones de cálculo financiero en el bundle JavaScript del cliente. Un usuario malicioso inspeccionando el código del browser no puede manipular cálculos financieros — porque todos ocurren en el servidor antes de ser enviados.

Los React Server Components son ideales para esto: el componente `BalanceDashboard` se renderiza en el servidor con los datos ya calculados, y llega al cliente como HTML estático más un JSON de hidratación mínimo.

## 8.2 Validación en Capas (Defense in Depth)

Cada input del usuario pasa por múltiples capas de validación antes de afectar el dominio:

```
UI (formulario)     → Validación Zod en el cliente (UX inmediata)
↓
tRPC Procedure     → Validación Zod en el servidor (segunda barrera)  
↓
Caso de Uso        → Validación de reglas de negocio (dominio)
↓
Base de Datos      → Constraints de BD (última barrera)
```

Un monto negativo es rechazado en el formulario del cliente. Si llega al servidor por algún bypass, Zod lo rechaza. Si pasa Zod, el dominio lo rechaza. Si pasa el dominio, la constraint `CHECK amount > 0` de la base de datos lo rechaza.

## 8.3 Inmutabilidad como Norma

Los objetos de dominio son inmutables por convención y por herramienta:
- TypeScript: los objetos de value objects usan `readonly` en todos sus campos.
- Los estados de entidades se modifican mediante métodos que retornan nuevas instancias.
- Los arrays de transacciones nunca se modifican directamente — se crean nuevos arrays.

Esta inmutabilidad facilita el rastreo de cambios, simplifica el debugging financiero, y elimina errores de mutación accidental.

## 8.4 Error Handling Consistente

**En el servidor (tRPC):** Los errores del dominio se mapean a códigos de error tRPC tipados. Los errores de negocio (monto inválido, saldo insuficiente) se diferencian de errores técnicos (fallo de BD).

**En el cliente (TanStack Query):** Los errores de las queries y mutations se capturan centralmente. El cliente distingue entre:
- **Errores de validación:** Se muestran inline en el formulario correspondiente.
- **Errores de negocio:** Se muestran como notificaciones informativas (el balance es insuficiente).
- **Errores técnicos:** Se muestran como alertas de error genéricas con opción de reintentar.

Ningún error expone información interna del servidor (stack traces, queries SQL, nombres de tablas).

## 8.5 Cero Tolerancia a `any` en TypeScript

El `tsconfig.json` activa `noImplicitAny: true`. Está absolutamente prohibido usar el tipo `any` en código de dominio o aplicación. En código de integración con librerías de terceros mal tipadas, se permite `unknown` con type guards explícitos.

Esto garantiza que los tipos financieros (montos, estados, categorías) son exactos en toda la cadena de código.

## 8.6 Separación Estricta de Código Cliente/Servidor

Next.js distingue entre código cliente y servidor mediante convenciones:
- `'use client'` al inicio de un archivo lo marca como componente cliente.
- `'use server'` marca Server Actions.
- Archivos sin directiva en `server/` solo se ejecutan en el servidor.

El principio es que **el acceso a la base de datos, los casos de uso de dominio, y las reglas de negocio nunca aparecen en archivos marcados como cliente**. Si por error un import de Prisma llega a un bundle cliente, Next.js lanza un error de build.

## 8.7 Variables de Entorno — Secretos Nunca en el Cliente

Las variables de entorno que contienen secretos (cadena de conexión a la BD, secreto de JWT de Auth.js, API keys externas futuras) nunca tienen el prefijo `NEXT_PUBLIC_`. Solo las variables con ese prefijo se incluyen en el bundle cliente.

El cliente solo tiene acceso a la URL base de la aplicación y las claves públicas de OAuth si se usan proveedores externos.

---

# 9. ESTRATEGIA DE AUTENTICACIÓN TÉCNICA

## 9.1 Flujo Completo de Autenticación

```
1. Usuario envía email + contraseña desde /login
2. Auth.js Credentials Provider verifica credenciales contra BD
3. La contraseña se compara con el hash bcrypt almacenado en User.passwordHash
4. Si válido: Auth.js genera un JWT Token firmado con el secreto del servidor
5. El token se almacena en una cookie httpOnly, secure, sameSite=strict
6. En cada request: Next.js Middleware verifica el token usando Auth.js
7. Si el token es válido: el request continúa con el userId inyectado en el contexto
8. Si el token es inválido o expirado: redirect automático a /login
```

## 9.2 Protección de Rutas por Middleware

El archivo `middleware.ts` en la raíz del proyecto intercepta todos los requests a rutas del grupo `(dashboard)` y verifica la sesión antes de que cualquier componente se ejecute. Las rutas de autenticación `(auth)` son accesibles sin sesión.

## 9.3 Contexto de sesión en tRPC

El `userId` de la sesión autenticada se inyecta en el contexto de tRPC durante la construcción del request. Todos los procedimientos protegidos acceden a `ctx.session.user.id` — nunca aceptan el `userId` como parámetro del input del cliente, lo que previene completamente el acceso a datos de otros usuarios incluso si el token es válido.

---

# 10. ESTRATEGIA DE TESTING

## 10.1 Tests Unitarios del Dominio (Vitest)

El dominio es la parte más crítica y la más fácil de testear: no tiene dependencias externas.

**Qué se testea:**
- Cálculo de balance con múltiples transacciones en distintos estados.
- Invariantes del dominio (intento de monto negativo, anulación de movimiento ya anulado).
- Lógica de las tres estrategias de ahorro.
- Precisión decimal en cálculos con ROUND_HALF_EVEN.
- Cálculo de monto mensual necesario para meta de ahorro.

**Principio:** Cada regla de negocio documentada en `ARQUITECTURA_LOGICA_NEGOCIO.md` tiene al menos un test unitario que verifica su cumplimiento.

## 10.2 Tests de Integración de API (Vitest + BD en memoria)

Los routers de tRPC se testean con un cliente tRPC de pruebas y una base de datos de test (Neon branching o BD PostgreSQL local).

**Qué se testea:**
- El flujo completo de registrar un ingreso y verificar que el balance cambia.
- La autorización: un usuario no puede acceder a transacciones de otro.
- La idempotencia: enviar el mismo comando dos veces no duplica la transacción.

## 10.3 Tests End-to-End (Playwright)

Tests de los flujos críticos del usuario contra la aplicación completa desplegada en un entorno de preview.

**Flujos cubiertos:**
- Registro de usuario → Login → Dashboard vacío.
- Registrar ingreso → verificar balance actualizado.
- Crear sección de ahorro → depositar → verificar saldo.
- Registrar ingreso extraordinario → verificar separación en reportes.

---

# 11. ESTRATEGIA DE DESPLIEGUE

## 11.1 Plataforma: Vercel

**Por qué Vercel:**
- El App Router de Next.js está optimizado específicamente para Vercel.
- Despliegue automático desde `git push` a la rama principal.
- Preview deployments automáticos para cada Pull Request (los tests e2e corren contra el preview).
- Edge middleware para protección de rutas con latencia mínima.

## 11.2 Base de Datos: Neon

- La BD de producción existe en el branch `main` de Neon.
- Las migraciones de Prisma se ejecutan como parte del proceso de build/deploy.
- Para cada PR, se puede crear un branch de BD de Neon automáticamente (datos de prueba aislados del productor).

## 11.3 Variables de Entorno por Entorno

| Variable | Development | Preview (PR) | Production |
|---|---|---|---|
| `DATABASE_URL` | BD local o Neon dev | Neon branch PR | Neon main |
| `NEXTAUTH_SECRET` | Secreto local | Secreto de preview | Secreto de producción (rotado) |
| `NEXTAUTH_URL` | `localhost:3000` | URL del preview | URL de producción |

## 11.4 Proceso de Release

```
Desarrollo local → PR con tests en CI → Preview deployment → Tests E2E en preview
→ Code review → Merge a main → Deploy automático a producción → Migración de BD
```

Las migraciones de base de datos se ejecutan de forma no destructiva (nunca `DROP COLUMN` directo — se usa el patrón expand/contract para migraciones sin downtime).

---

# RESUMEN EJECUTIVO DEL STACK

| Decisión | Elección | Alternativa Descartada | Razón Principal |
|---|---|---|---|
| **Arquitectura** | Full-stack Next.js | Backend separado (NestJS + React) | Complejidad innecesaria para mono-usuario |
| **API** | tRPC | REST / GraphQL | Type-safety extrema sin codegen |
| **Base de Datos** | PostgreSQL (Neon) | MongoDB | ACID y tipos exactos para finanzas |
| **ORM** | Prisma | Drizzle / TypeORM | Migraciones + tipado + DX superior |
| **Auth** | Auth.js v5 | Clerk / Supabase Auth | Control total, sin vendor lock-in costoso |
| **Estado servidor** | TanStack Query | SWR / Apollo | Ecosistema más maduro y flexible |
| **Estado cliente** | Zustand | Redux / Jotai | Simplicidad máxima para estado de UI |
| **Estilos** | Tailwind v4 | CSS Modules / Styled Components | Velocidad + consistencia |
| **Componentes** | shadcn/ui | MUI / Chakra | Control total del markup, sin dependencia |
| **Despliegue** | Vercel | Railway / Fly.io | Integración nativa con Next.js |

---

*Documento generado como especificación técnica de implementación. Complementa `ARQUITECTURA_LOGICA_NEGOCIO.md`. Versión 1.0 — Marzo 2026.*
