# NodoTech · Módulo Marketing — Análisis con Atribución Real

Implementación del sub-módulo **07 — Análisis**: dashboard de entrada, atribución
multi-touch sobre datos cruzados *marketing + POS*, reconciliación de **ROAS real vs
ROAS de plataforma (píxel)** y un **Action Center** que convierte recomendaciones
derivadas del dato en tasks accionables.

**Stack:** NestJS + PostgreSQL (TypeORM, migrations) · Next.js (App Router) + React +
React Query + Recharts.

---

## Requisitos

- Node 20+
- Docker (para Postgres) — o un Postgres local

## Arranque rápido

```bash
# 1. Base de datos
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env
npm install
npm run migration:run
npm run seed
npm run start:dev          # API en http://localhost:3001/api

# 3. Frontend (en otra terminal)
cd frontend
cp .env.example .env.local
npm install
PORT=3002 npm run dev      # App en http://localhost:3002
```

Abrir **http://localhost:3002** e iniciar sesión con el usuario demo:

```
email:    demo@nodotech.io
password: demo12345
```

> El puerto de Postgres por defecto es **5439** (para no chocar con un Postgres local
> en 5432). Es configurable con `DB_PORT` en `backend/.env` y `docker-compose.yml`.

## Scripts útiles (backend)

```bash
npm test                 # 45 tests unitarios (atribución, reportes, reglas, edge cases)
npm run test:e2e         # 38 tests e2e (auth, reportes, action-center, multi-tenant, casos límite)
npm run migration:run    # aplica migrations
npm run seed             # recarga datos sintéticos + usuario demo
npm run build            # compila
```

> Los tests e2e levantan la app real contra Postgres y crean sus propias bases de datos
> de test (`nodotech_test_*`) automáticamente; solo requieren que el contenedor de Postgres
> esté arriba (`docker compose up -d`).

---

## Decisiones de diseño y supuestos

### Multi-tenant + Auth
El enunciado permite resolver el `business_id` por header o por usuario autenticado.
Elegí **usuario autenticado con JWT en cookie httpOnly** por ser la opción más segura: el
`business_id` se deriva del token (no de un header falsificable), un `JwtAuthGuard` global
protege todos los endpoints (salvo los marcados `@Public()`), y cada query queda scoped al
negocio del usuario. La cookie es `httpOnly`, `SameSite=Lax` y `Secure` en producción.

### Atribución (núcleo)
Para cada venta POS se reconstruye el **path**: touchpoints del mismo contacto
**anteriores** a la venta y dentro de la **ventana de atribución** (configurable, default
**30 días**), ordenados cronológicamente. El crédito del monto se reparte según el modelo.
Los tres modelos son **funciones puras** (`backend/src/attribution/models/`):

- **Lineal** — crédito igual a cada touchpoint (`monto / n`).
- **Time-decay** — peso `2^(-Δdías / half-life)`, **half-life = 7 días**. Más crédito a
  los touchpoints cercanos a la conversión.
- **Position-based (U-shaped)** — 40% primer touchpoint, 40% último, 20% repartido entre
  los intermedios. Casos borde: 1 TP → 100%; 2 TP → 50/50.

**Invariante garantizado y testeado:** la suma de créditos de cada venta es exactamente el
monto de la venta. El residuo de redondeo se ajusta en el último touchpoint
(`credit.util.ts`). El modelo es **conmutable** desde la UI y recalcula todo el dashboard.

### Reportes y reconciliación
- Las métricas core y la tabla por campaña combinan el crédito atribuido (servicio) con
  **agregaciones SQL** de inversión, ingreso de píxel y conteo de conversiones.
- El cruce evita N+1: una query carga las ventas del rango, otra los touchpoints de esos
  contactos; se agrupan en memoria y se aplica el modelo.
- **Diferencia %** de reconciliación = `(píxel − atribuido) / atribuido`. Se resalta
  cuando supera el **5%**.
- Insight por **origen de audiencia**: el spend de cada campaña se prorratea entre orígenes
  según su crédito en esa campaña, para obtener un ROAS real comparable por origen.

### Action Center
Reglas puras (`action-center/rules/`) que derivan recomendaciones del dato real:
ROAS real < 1 → *pausar/redistribuir*; mejor origen rentable → *escalar*; brecha de
reconciliación > 5% → *auditar píxel*. Cada recomendación se acepta como **task** (con
dueño, fecha sugerida, contexto y CTA), se puede completar o descartar.

### Extras incluidos
- Tests del algoritmo (suma de crédito, proporciones, casos borde) y de reportes.
- Ventana de atribución configurable por el usuario.
- Insight por origen de audiencia (bloque 7.2).
- Export CSV del reporte por campaña.
- Input **conversacional** (parser de reglas determinista, sin LLM) que traduce texto a
  filtros del dashboard.

### Fuera de alcance (siguiente iteración)
Refresh tokens / rotación de JWT · modelo de atribución data-driven ML (roadmap v1.5) ·
export PDF · sync bidireccional con Meta/Google · caché persistente de atribución.

---

## Estructura

```
backend/   NestJS · src/{auth,reports,action-center,attribution,seed,...}
frontend/  Next.js · src/{app,components,lib,providers}
docker-compose.yml
```

## Variables de entorno

**backend/.env**

| Variable | Default | Descripción |
|---|---|---|
| `DB_HOST` / `DB_PORT` | `localhost` / `5439` | Conexión a Postgres |
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | `nodotech` / `nodotech` / `nodotech_marketing` | Credenciales |
| `JWT_SECRET` | — | Secreto para firmar el JWT |
| `JWT_EXPIRES_IN` | `7d` | Expiración del token |
| `PORT` | `3001` | Puerto de la API |
| `FRONTEND_ORIGIN` | `http://localhost:3002` | Origen permitido por CORS |

**frontend/.env.local**

| Variable | Default | Descripción |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` | URL de la API |
