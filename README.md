# Male Neural Network

A full-stack AI-powered platform for visualizing and analyzing the male neural network in real time.

## Live

| Service  | URL |
|----------|-----|
| Frontend | https://male-neuro-analysis-system.vercel.app |
| Backend  | https://male-neuro-analysis-system.onrender.com |

---

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React 18, Vite, Three.js (@react-three/fiber) |
| Backend   | Spring Boot 3.4, Java 21 |
| Database  | MongoDB Atlas |
| AI        | Groq (LLaMA 3.3 70B) |
| Email     | Resend API |
| Auth      | JWT (stateless) |
| Deploy    | Vercel (frontend) · Render (backend) · Docker |

---

## Features

- 3D interactive neural network visualization
- 3D anatomical brain scan view
- Real-time AI neural coach chat
- Neural profile creation and management
- Metrics panel with coherence scoring
- Email verification on registration
- JWT-based authentication
- Account settings — change password, delete account

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
    │   └── api.js                  # Backend API calls
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
