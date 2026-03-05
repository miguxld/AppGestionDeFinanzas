# 📋 Documentación del Desarrollo — TheOneShot Finance App

**Proyecto:** App de Gestión de Finanzas Personales  
**Autor:** miguxld  
**Fecha:** Marzo 2026  
**URL de Producción:** https://app-gestion-de-finanzas.vercel.app  
**Repositorio:** https://github.com/miguxld/AppGestionDeFinanzas

---

## 🏗️ Arquitectura del Sistema

Se implementó una arquitectura **Full-Stack Monolito Modular** basada en **Clean Architecture** con separación por capas:

```
┌─────────────────────────────────────────────────┐
│              CLIENTE (Browser)                   │
│  Next.js App Router · React 19 · TypeScript      │
│  TanStack Query · Zustand · Tailwind CSS v4      │
└──────────────────┬──────────────────────────────┘
                   │ tRPC (type-safe RPC)
┌──────────────────▼──────────────────────────────┐
│              SERVIDOR (Next.js)                   │
│  tRPC Routers · Auth.js v5 · Prisma ORM          │
│  Casos de Uso · Dominio · Infraestructura        │
└──────────────────┬──────────────────────────────┘
                   │ Prisma ORM
┌──────────────────▼──────────────────────────────┐
│              BASE DE DATOS                        │
│  PostgreSQL (Neon — Serverless)                   │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript (strict mode) |
| API | tRPC v11 |
| Base de Datos | PostgreSQL 16 (Neon Serverless) |
| ORM | Prisma 6 |
| Autenticación | Auth.js v5 (NextAuth) |
| Validación | Zod |
| Estado Servidor | TanStack Query v5 |
| Estado Cliente | Zustand v5 |
| Estilos | Tailwind CSS v4 + shadcn/ui |
| Gráficas | Recharts |
| Animaciones | Framer Motion |
| Testing | Vitest + Testing Library |
| Despliegue | Vercel |

---

## 📂 Estructura del Proyecto

```
src/
├── app/                          # Capa de Presentación (Next.js App Router)
│   ├── login/                    # Página de inicio de sesión
│   ├── register/                 # Página de registro
│   ├── (dashboard)/              # Rutas protegidas
│   │   ├── page.tsx              # Dashboard principal
│   │   ├── income/               # Registro de ingresos
│   │   ├── expenses/             # Registro de egresos
│   │   ├── savings/              # Secciones de ahorro
│   │   ├── extraordinary/        # Ingresos extraordinarios
│   │   ├── budgets/              # Presupuestos
│   │   └── analytics/            # Análisis financiero
│   └── api/
│       ├── trpc/[trpc]/          # tRPC handler
│       └── auth/[...nextauth]/   # Auth.js handler
│
├── server/                       # Código exclusivo del servidor
│   ├── domain/                   # Capa de Dominio (entidades, value objects)
│   ├── application/              # Capa de Aplicación (casos de uso, queries)
│   ├── infrastructure/           # Capa de Infraestructura (repositorios, DB)
│   ├── api/                      # tRPC Routers
│   ├── auth.ts                   # Auth.js config completa (servidor)
│   └── auth.config.ts            # Auth.js config Edge (middleware)
│
├── shared/                       # Código compartido (schemas Zod, tipos)
├── store/                        # Zustand stores
├── components/                   # Componentes React
│   ├── ui/                       # shadcn/ui base components
│   ├── layout/                   # Sidebar, navegación
│   └── forms/                    # Formularios de registro
│
├── middleware.ts                  # Protección de rutas (Edge-compatible)
└── lib/                          # Utilidades (tRPC client, utils)
```

---

## 📊 Modelo de Datos (Prisma)

Se implementaron las siguientes entidades en PostgreSQL:

- **User** — Usuario titular con autenticación bcrypt
- **FinancialTransaction** — Log de movimientos (append-only)
- **SavingsSection** — Secciones de ahorro con 3 estrategias (fijo, porcentaje, meta)
- **SavingsDeposit** — Depósitos/retiros a secciones de ahorro
- **ExtraordinaryIncome** — Ingresos no recurrentes (prima, cesantías, bonos)
- **BalanceSnapshot** — Snapshots de balance para optimización
- **AuditLog** — Log de auditoría (write-only)
- **Budget** — Presupuestos por categoría y período
- **Session** — Sesiones de usuario

---

## 🔐 Autenticación

- **Auth.js v5** con Credentials Provider (email + contraseña)
- Contraseñas hasheadas con **bcrypt** (factor 12)
- Sesiones basadas en **JWT** almacenados en cookies httpOnly
- Middleware de Next.js protege rutas del dashboard
- Configuración dividida en dos archivos para compatibilidad con Vercel Edge Runtime:
  - `auth.config.ts` — Configuración ligera para el middleware (Edge)
  - `auth.ts` — Configuración completa con bcrypt y Prisma (servidor)

---

## 🧪 Testing

Se implementaron tests unitarios con **Vitest** cubriendo:

- **Dominio:** Entidades financieras, value objects (Money, Period, Percentage)
- **Casos de uso:** Registro de transacciones, creación de secciones de ahorro
- **tRPC Routers:** Auth, Financial, Budget, Analytics, AI
- **Stores:** Zustand stores (currency, financial)
- **Componentes:** Login y Register con Testing Library

---

## 🎨 Diseño UI/UX

- Diseño **Dark Premium** con estética futurista
- **Glassmorphism 2.0** con gradientes radiales profundos
- Animaciones con **Framer Motion** (sidebar, cards, transiciones)
- **AI Orb** integrado como asistente inteligente (Gemini via OpenRouter)
- Componentes shadcn/ui personalizados
- Dashboard interactivo con gráficas Recharts
- Diseño responsive

---

## 🚀 Despliegue

### Plataforma: Vercel + Neon

- **Build command:** `npx prisma generate && npx prisma migrate deploy && next build`
- Migraciones de Prisma se ejecutan automáticamente en cada deploy
- Deploy automático desde `git push` a la rama `main`

### Variables de Entorno Configuradas

| Variable | Propósito |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL en Neon |
| `NEXTAUTH_SECRET` | Secreto para firmar tokens JWT |
| `NEXTAUTH_URL` | URL de producción de la app |
| `AUTH_TRUST_HOST` | Habilitar trust del host en Vercel |
| `OPENROUTER_API_KEY` | API key para el asistente de IA |

---

## 📝 Proceso de Desarrollo (Resumen Cronológico)

1. **Diseño de Arquitectura** — Documentos `ARQUITECTURA_LOGICA_NEGOCIO.md` y `STACK_Y_ARQUITECTURA_TECNICA.md` definiendo Clean Architecture, DDD, modelo de datos y stack tecnológico.

2. **Construcción del Frontend** — Dashboard, páginas de login/registro, sidebar con animaciones, AI Orb, formularios para ingresos/egresos/ahorro.

3. **Diseño UI Premium** — Overhaul visual con Framer Motion, glassmorphism, gradientes, tipografía moderna y micro-animaciones.

4. **Backend con Clean Architecture** — Refactorización en capas: Dominio (entidades, value objects), Aplicación (casos de uso), Infraestructura (repositorios Prisma), API (tRPC routers).

5. **Base de Datos y Autenticación** — Conexión a Neon PostgreSQL, implementación de Auth.js v5 con Credentials Provider, protección de rutas.

6. **Testing** — Tests unitarios para dominio, casos de uso, routers tRPC, stores y componentes de autenticación.

7. **Asistente de IA** — Integración con Gemini 1.5 Flash via OpenRouter API para asistencia financiera inteligente.

8. **Despliegue en Vercel** — Configuración de variables de entorno, resolución del límite de 1MB del Edge middleware, deploy exitoso con migraciones automáticas.

---

## 📚 Documentos de Referencia

- `ARQUITECTURA_LOGICA_NEGOCIO.md` — Arquitectura, DDD, reglas de negocio financiero
- `STACK_Y_ARQUITECTURA_TECNICA.md` — Stack tecnológico, justificaciones, diseño de API
- `DESARROLLO_COMPLETO.md` — Este documento

---

*Documento generado como registro del proceso completo de desarrollo. Marzo 2026.*
