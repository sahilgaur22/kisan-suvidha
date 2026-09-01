# Kisan Suvidha — Dynamic Queue Optimization & Center Management Portal

**Smart India Hackathon (SIH) — Problem Statement 26032**  
*Ministry of Consumer Affairs, Food & Public Distribution*

---

## 🌾 About Kisan Suvidha

**Kisan Suvidha** is a multi-tenant, cloud-native procurement center management platform designed to eliminate long queues and dynamic slot allocation bottlenecks for farmers across India.

### Key Capabilities
- **Dynamic Slot Allocation Engine:** Computes optimal appointment windows based on crop volume, vehicle throughput factor, and real-time center processing metrics.
- **Strict Multi-Tenant Center Isolation:** Enforced via dual-layer security (FastAPI RBAC dependencies + PostgreSQL Row Level Security policies).
- **Omnichannel Token Booking:** Seamless slot booking across Web Portal, PWA, WhatsApp Cloud API, and Twilio SMS fallback for low-connectivity rural regions.
- **Strict Queue Integrity:** Guaranteed date/time queue ordering (`booking_date`, `slot_start_time`) protected against race conditions by DB-level triggers (3 bookings/day per farmer).
- **Live Administrative Dashboard & MSP Broadcast:** Real-time token monitoring, live MSP price updates, and payment audit trails.

---

## 🏗️ System Architecture

```
                                  ┌────────────────────────┐
                                  │   Farmer (Web/PWA/SMS) │
                                  └───────────┬────────────┘
                                              │
                                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                     Frontend Layer                                     │
│  Next.js 14 (App Router) + Tailwind CSS + Zustand + TanStack Query + socket.io-client  │
└─────────────────────────────────────────────┬──────────────────────────────────────────┘
                                              │ REST / WebSockets
                                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                     Backend Layer                                      │
│  FastAPI (Async Python 3.11) + JWT RBAC + Pydantic v2 + Socket.io Server               │
└──────────────┬──────────────────────────────┬───────────────────────────┬──────────────┘
               │                              │                           │
               ▼                              ▼                           ▼
┌──────────────────────────────┐ ┌──────────────────────────┐ ┌──────────────────────────┐
│     PostgreSQL 15 Database   │ │     Redis Cache & Queue  │ │     Celery Worker        │
│   (Row Level Security / RLS) │ │ (Rate Limiting & Memory) │ │ (Notification & Recalc) │
└──────────────────────────────┘ └──────────────────────────┘ └──────────────────────────┘
```

---

## 📁 Repository Structure

```
.
├── backend/                  # FastAPI Application Core
│   ├── app/                  # Application Modules (API, Models, Schemas, Services, Tasks)
│   ├── alembic/              # Database Migrations
│   ├── tests/                # Automated Test Suite
│   ├── Dockerfile            # Backend Container Spec
│   └── requirements.txt      # Python Dependencies
│
├── frontend/                 # Next.js 14 Web Portal & PWA
│   ├── app/                  # App Router Pages & Layouts
│   ├── components/           # UI Components (shadcn/ui + custom)
│   ├── lib/                  # API Clients & Utilities
│   ├── store/                # Zustand State Stores
│   ├── hooks/                # Custom React Hooks
│   ├── locales/              # Multi-lingual translations (en, hi)
│   └── public/               # Static Assets & PWA Manifest
│
├── docker-compose.yml        # Development & Orchestration Environment
└── README.md                 # Project Overview & Setup Guide
```

---

## 🚀 Quickstart & Local Development

### Prerequisites
- Docker & Docker Compose
- Node.js (v18+)
- Python 3.11+

### Running with Docker Compose
```bash
# Clone the repository
git clone https://github.com/your-team/kisan-suvidha.git
cd kisan-suvidha

# Start all services (PostgreSQL, Redis, Backend, Celery, Frontend)
docker-compose up --build
```

Access services:
- **Frontend Portal:** `http://localhost:3000`
- **Backend API Docs (Swagger):** `http://localhost:8000/docs`
- **Health Check:** `http://localhost:8000/api/v1/health`

---

## 🧪 Testing

```bash
# Backend test suite
cd backend
pytest tests/ -v
```

---

## 👥 Team
Built with ❤️ by our SIH Team for Problem Statement 26032.
