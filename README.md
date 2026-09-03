# Kisan Suvidha — Dynamic MSP Token & Queue Management System

**Smart India Hackathon (SIH 2026)** | Problem Statement ID: **26032**  
**Ministry:** Ministry of Consumer Affairs, Food and Public Distribution  

---

## 🌾 Project Overview

**Kisan Suvidha** is an enterprise multi-tenant platform designed to eliminate long queues and mill mandi congestion during seasonal Minimum Support Price (MSP) crop procurement (Paddy, Wheat, Mustard, Maize).

### Key Features:
- ⏱️ **Dynamic Arrival Slot Engine:** Calculates precise arrival time windows based on crop volume, vehicle throughput speed, and daily mandi processing capacities.
- 📡 **Real-Time WebSocket Queue Broadcasts:** Center-scoped live queue synchronization with auto-reconnect backoff for rural 4G connectivity.
- 📱 **Omnichannel Conversational Booking:** WhatsApp Cloud API & Twilio SMS webhooks with 10-minute ephemeral Redis state machine.
- 🛡️ **Strict Multi-Tenant Row Level Security (RLS):** Center Admins and Staff are strictly isolated to their assigned procurement center.
- 💰 **Guaranteed MSP Payout Audit Trail:** Automatic calculation of gross payouts based on live MSP rates per quintal.
- 📶 **Progressive Web App (PWA):** Offline service worker caching and mobile install banner for ground staff tablets and farmer smartphones.

---

## 🛠️ Technology Stack

- **Backend:** FastAPI (Python 3.12), SQLAlchemy 2.0 (AsyncPG), PostgreSQL 15, Redis 7, Celery 5, PyJWT, WebSockets.
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, TanStack Query v5, i18next (English & Hindi).
- **Orchestration:** Docker, Docker Compose, Alembic DB Migrations.

---

## 🚀 Quick Start (Local Development)

### 1. Run with Single Command (Windows Launcher)
```powershell
.\start.bat
```
This launches the FastAPI Backend (`http://localhost:8000`), Next.js Frontend (`http://localhost:3000`), and automatically opens your browser.

### 2. Run with Docker Compose
```bash
docker-compose up --build
```

---

## 🧪 Unit & Integration Test Suite Execution

Run the complete 37-test suite verifying auth, queue engine, RLS multi-tenant security, omnichannel webhooks, and real-time WebSockets:

```bash
.\venv\Scripts\pytest.exe backend/tests
```

Pass Rate: **100% (37 passed in 2.18s)**
