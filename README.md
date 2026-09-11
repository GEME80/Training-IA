# ⚡ SGEA Pro (v2.5) — Sistema Adaptativo de Entrenamiento Inteligente
> **Plataforma de Alto Rendimiento Fisiológico, Periodización Dinámica y Prescripción Adaptativa con IA para Deportes de Resistencia (Carrera, Ciclismo y Triatlón).**

---

## 🌟 Características Principales

- 📊 **Calendario Continuo & Telemetría Banister:** Visualización de carga en vivo estilo Intervals.icu con seguimiento de Fitness (CTL), Fatiga (ATL), Forma (TSB) y Balance de Carga semanal.
- 🤖 **Head Coach Digital con IA (Google Gemini):** Análisis cualitativo y cuantitativo del estado del atleta, adaptación de microciclos y chat interactivo con diffing de workouts.
- 🎯 **Suite de Modelos Científicos Curados (SSOT):** Periodización basada en Renato Canova, Jack Daniels, Pete Pfitzinger, Dr. Andrew Coggan, Joe Friel, Jan Olbrecht y Dr. Stephen Seiler (80/20).
- ⚡ **Integración Nativa con Stryd & Garmin:** Prescripción exacta en vatios (% FTP / CP) + tiempo, eliminando cualquier desfase en relojes Garmin.
- 🔒 **Seguridad y Criptografía Militar:** Autenticación Google OAuth vía Firebase Auth y almacenamiento de API Keys en Cloud Firestore cifradas con **AES-256-GCM**.
- 🛠️ **Arquitectura 100% Modular:** Todos los componentes UI desacoplados en submódulos atómicos (< 350 líneas de código).

---

## 🏛️ Arquitectura del Sistema

```mermaid
flowchart TD
    subgraph Frontend_App [" Frontend (Next.js 15 App Router & Tailwind CSS) "]
        DASH[Mi Dashboard: Calendario Continuo & Telemetría PMC]
        SEAS[Mi Temporada: Curva SVG, Diseñador IA & Carreras A/B/C]
        COACH[Head Coach IA: Chat Conversacional & Diffing en Vivo]
        PROF[Perfil del Atleta: Zonas Stryd, FTP & Matriz Semanal]
    end

    subgraph Backend_Engine [" Backend & API Routes (/api/) "]
        EVAL[/api/evaluate: Telemetría Intervals.icu & Motor Banister]
        SYNC[/api/sync-intervals: Prescripción de Workouts Stryd]
        MACRO[/api/macrocycles: Generador & Encadenamiento de Fases]
        CHAT[/api/headcoach/chat: Inferencia Fisiológica con Gemini]
    end

    subgraph Knowledge_Layer [" Capa de Conocimiento Científico SSOT "]
        KM[src/lib/ai/knowledge/ - 12 Modelos Fisiológicos Curados]
    end

    subgraph Cloud_Services [" Servicios Cloud & Persistencia "]
        INT[Intervals.icu REST API v1]
        FS[(Cloud Firestore - users/uid con AES-256-GCM)]
        GEM[Google Gemini 2.5 / 3.0 API]
    end

    Frontend_App <--> Backend_Engine
    Backend_Engine --> KM
    Backend_Engine <--> INT
    Backend_Engine <--> FS
    Backend_Engine <--> GEM
```

---

## 🚀 Inicio Rápido (Desarrollo Local)

### 1. Requisitos Previos
- **Node.js:** v20+ o v24+
- **NPM:** v10+
- Cuenta en [Intervals.icu](https://intervals.icu)

### 2. Instalación de Dependencias
```bash
npm install
```

### 3. Configuración de Variables de Entorno
Copia el archivo `.env.example` a `.env.local`:
```bash
cp .env.example .env.local
```
Configura tus credenciales de Firebase, Google Gemini API y tu clave maestra de cifrado (`ENCRYPTION_KEY`).

### 4. Arranque del Servidor en el Puerto 3000
> **IMPORTANTE:** Usa siempre el script `npm run dev:clean` para evitar conflictos con procesos zombis en puertos secundarios.
```bash
npm run dev:clean
```
Abre tu navegador en [http://localhost:3000](http://localhost:3000).

---

## 📁 Mapa del Repositorio

```text
IA Training/
├── BITACORA_MAESTRA.md             # Dossier histórico, memoria central y changelog
├── PROJECT_RULES.md               # Leyes de gobernanza inmutables y prompt maestro
├── BACKLOG_MEJORAS_ARQUITECTURA.md # Backlog de auditoría técnica y refactorizaciones
├── src/
│   ├── app/                       # Next.js App Router y API Routes (/api/)
│   ├── components/                # Componentes UI organizados por dominio (< 350 LOC)
│   │   ├── admin/                 # Panel de SuperAdmin y monitor de tokens
│   │   ├── dashboard/             # Calendario continuo y widgets de telemetría
│   │   ├── macrocycle/            # Línea de tiempo y visor de microciclos
│   │   ├── profile/               # Perfil del atleta y zonas de potencia
│   │   └── season/                # Estudio de temporada y curvas SVG
│   ├── context/                   # Contextos globales (AuthContext)
│   ├── hooks/                     # Custom Hooks de estado
│   └── lib/                       # Lógica de negocio y motores fisiológicos
│       ├── ai/                    # Inferencia de IA, prompts y fallback
│       │   └── knowledge/         # Modelos científicos SSOT (Canova, Daniels, Coggan)
│       ├── db/                    # Persistencia Firestore y AES-256-GCM
│       ├── intervals/             # Cliente HTTP para Intervals.icu API
│       └── physiology/            # Algoritmos de Banister, macrociclos y templates
```

---

## 🧪 Verificación de Calidad y Compilación

Para asegurar la integridad del código en cualquier momento:
```bash
# Verificación estricta de tipos TypeScript (Código 0)
npx tsc --noEmit

# Compilación y empaquetado de producción de Next.js (Código 0)
npm run build
```

---

## 📄 Licencia y Derechos
Desarrollado para la optimización biomecánica y fisiológica de atletas de resistencia.
