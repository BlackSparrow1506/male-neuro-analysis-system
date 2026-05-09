# Male Neural Network

A full-stack AI-powered platform for visualising and analysing the male brain in real time. Turn your lifestyle data — sleep, stress, focus, emotional state — into a living 3D map of your mind.

## Live

| Service  | URL |
|----------|-----|
| Frontend | https://male-neuro-analysis-system.vercel.app |
| Backend  | https://male-neuro-analysis-system.onrender.com |

---

## What It Is

Most wellness tools treat the brain as a black box. This platform gives men a clear, visual understanding of their own neural activity so that improving focus, managing stress, and building mental resilience becomes something you can *see*, not just feel.

Every metric is rooted in male neuroscience — testosterone-driven motivation circuits, stress-response patterns, and focus architectures specific to the male brain. The goal is to make peer-reviewed neuroscience tangible, personal, and actionable without requiring a background in science.

---

## Core Capabilities

| # | Feature | What It Does |
|---|---------|-------------|
| 01 | **3D Neural Network** | Interactive real-time 3D map of active brain regions. Rotate, zoom, and explore every neural cluster. Nodes pulse with live activity scores derived from your profile data. |
| 02 | **AI Neural Coach** | Describe your mental state in plain language. The AI interprets your input, updates your brain map instantly, and delivers science-backed personalised recommendations. |
| 03 | **Anatomical Brain Scan** | Switch to a clinical perspective for region coherence scores, functional states, and a deeper anatomical understanding of what drives your daily performance. |
| 04 | **Neural Metrics Panel** | Tracks Sleep Quality, Stress Level, Focus Index, Emotional Balance, Creativity, Analytical Thinking, Social Engagement, Physical Activity, Mindfulness, and Cognitive Load — each rendered as a live percentage bar with a neural coherence score. |
| 05 | **Bhagavad Gita Wisdom** | For every metric flagged as "needs work", the platform pairs the actual score with a relevant verse from the Bhagavad Gita — Sanskrit (Devanagari), IAST transliteration, English meaning, the neuroscience impact of the imbalance, and the Gita's prescribed practice. The verse-meaning passage can be translated into 16 languages on the fly while the Sanskrit shloka stays untouched. |

---

## Why the Bhagavad Gita

The neural coach diagnoses *what* is out of balance; the Gita layer answers *what to do about it*. The Gita is one of the oldest systematic texts on the male inner battlefield — Arjuna's anxiety, paralysis, anger, doubt, and search for steadiness map almost cleanly onto modern constructs of low mindfulness, elevated stress, weak focus, and emotional dysregulation. By cross-referencing each weak metric against the situation taxonomy in the Gita (anger, fear, depression, uncontrolled mind, demotivation, losing hope, seeking peace…), the platform pairs measurable neural imbalances with prescriptive verses that have guided practitioners for two and a half millennia. Modern neuroscience names the problem; the Gita prescribes the discipline.

---

## The Science Behind It

The platform models male-specific neural circuits identified in peer-reviewed research:

| Brain Region | Function |
|-------------|----------|
| **BNST / POA Circuit** | Sexual behaviour and mate-seeking; dopamine-driven reward circuitry, developmentally fixed by hormonal exposure |
| **VMHvl Circuit** | Reactive aggression and territorial behaviour; integrates threat cues with testosterone levels |
| **Mesolimbic Dopamine** (VTA → NAcc → PFC) | Reward, motivation, and drive; testosterone potentiates dopamine release in the nucleus accumbens |
| **Right Amygdala** | Emotional memory encoding and threat processing; males show preferential right-hemisphere activation linked to action-oriented memory |
| **Hypothalamus INAH-3** | 2–3× larger in males; governs sex drive, gonadotropin release, and hormonal regulation |
| **Cerebellum** | Motor coordination, spatial navigation, and cognitive processing; males show higher metabolic activity and volume |

Key structural findings incorporated into the model:
- Male brains are optimised for **intra-hemispheric communication** — stronger front-to-back wiring within each hemisphere, supporting perception-to-action coordination
- Higher **white matter density** supports long-distance intra-hemispheric signalling
- Sex-specific neurons account for ~25% of the male neural network (demonstrated in *C. elegans* research), establishing sex-specific circuitry as a fundamental organising principle

---

## Our Principles

**Transparency** — Every metric is explained, every region is labelled, every recommendation is justified. No black boxes.

**Precision** — Generic wellness tools do not account for the male brain. Models are calibrated to male neural architecture, hormonal patterns, and behavioural science.

**Accessibility** — Advanced neuroscience should not require a PhD. Complex findings are translated into visual, intuitive experiences.

**Actionability** — Every output is designed to produce a clear, concrete next step — not just information.

---

## Disclaimer

This platform is an educational and self-reflection tool, not a medical device. Visualisations are approximations derived from population-level neuroscience research; individual variation is substantial. Nothing here constitutes clinical diagnosis or professional mental health advice. If any result or insight concerns you, consult a qualified medical or mental health professional.

---

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React 18, Vite, Three.js (@react-three/fiber) |
| Backend   | Spring Boot 3.4, Java 21 |
| Database  | MongoDB Atlas |
| AI        | Groq (LLaMA 3.3 70B) |
| TTS       | ElevenLabs API (voice: Adam) |
| Email     | Resend API |
| Auth      | JWT (stateless) |
| Deploy    | Vercel (frontend) · Render (backend) · Docker |

---

## Features

- 3D interactive neural network visualisation with hover tooltips and orbit controls
- 3D anatomical brain scan view with region labels
- Real-time AI neural coach chat (voice input + ElevenLabs TTS output)
- Bhagavad Gita Wisdom tab — verse-by-verse guidance keyed to your weakest neural metrics, with on-the-fly translation into 16 languages
- Neural profile creation and management (multiple profiles per account)
- Metrics panel with 10 neural metrics and overall coherence score
- Email verification on registration
- JWT-based stateless authentication
- Account settings — change password, delete account (cascading data removal)
- Mobile-responsive with tabbed navigation (3D View / Metrics / Gita / Chat)

---

## Project Structure

```
male-neuro-analysis-system/
├── Male-neuro-network-backend/     # Spring Boot API
│   ├── src/main/java/com/maleneuro/
│   │   ├── controller/             # REST endpoints
│   │   ├── model/                  # MongoDB documents
│   │   ├── repository/             # Data access
│   │   ├── service/                # Business logic
│   │   └── config/                 # Security, CORS, JWT
│   ├── Dockerfile
│   └── pom.xml
│
└── Male-neuro-network-frontend/    # React app
    ├── src/
    │   ├── components/             # UI components
    │   ├── App.jsx                 # Root + routing
    │   ├── api.js                  # Backend API calls
    │   └── mobile.css              # Mobile responsive styles
    └── vite.config.js
```

---

## API Endpoints

### Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new account |
| POST | `/api/auth/login` | Login, returns JWT |
| GET  | `/api/auth/verify` | Email verification |
| POST | `/api/auth/resend-verification` | Resend verification email |

### Auth (Protected — requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/auth/me` | Get current user info |
| PUT    | `/api/auth/password` | Change password |
| DELETE | `/api/auth/account` | Delete account + all data |

### Profiles (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/profiles` | List all profiles |
| POST   | `/api/profiles` | Create profile |
| GET    | `/api/profiles/{id}` | Get profile |
| PUT    | `/api/profiles/{id}` | Update profile |
| DELETE | `/api/profiles/{id}` | Delete profile |

### Chat (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/chat/{profileId}` | Send message |
| GET    | `/api/chat/{profileId}/history` | Get chat history |
| DELETE | `/api/chat/{profileId}/history` | Clear chat history |

### TTS (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/tts` | Synthesise speech via ElevenLabs |

### Gita Wisdom (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/gita/{profileId}/guidance` | Generate Bhagavad Gita guidance cards from the profile's weak metrics |
| POST   | `/api/gita/translate` | Translate the meaning/impact prose of a card into a target language (Sanskrit shloka stays in Devanagari) |

---

## Local Development

### Backend
```bash
cd Male-neuro-network-backend
cp .env.example .env
# Fill in your .env values
./mvnw spring-boot:run
```

### Frontend
```bash
cd Male-neuro-network-frontend
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:8080
npm install
npm run dev
```

---

## Environment Variables

### Backend
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `MONGODB_DATABASE` | Database name (`maleneuro`) |
| `JWT_SECRET` | Secret key for JWT signing |
| `GROQ_API_KEY` | Groq AI API key |
| `ELEVENLABS_API_KEY` | ElevenLabs TTS API key |
| `RESEND_API_KEY` | Resend email API key |
| `CORS_ALLOWED_ORIGINS` | Frontend URL |
| `APP_BASE_URL` | Backend public URL |
| `FRONTEND_URL` | Frontend public URL |
| `MAIL_ENABLED` | `true` / `false` |
| `MAIL_FROM` | Sender email address |

### Frontend
| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend URL |
