# My Aura — Full-Stack Marketplace

> A production-oriented, full-stack platform for sports venue booking and professional coaching. Built with a strong emphasis on security, scalability, internationalization, and end-to-end type safety.

## 📖 Overview

**My Aura** is a modern web application that connects users with sports venues and professional coaches. It is architected as a monorepo, housing a robust **Node.js/Express REST API** and a **Next.js 16 App Router frontend**. 

The platform is designed with a "security-first" mindset, featuring an advanced JWT authentication system (with token rotation), rigorous data validation (Zod), and a fully localized UI (RTL Persian & LTR English).

## 🏗️ High-Level Architecture

The system is fully containerized using Docker and operates on a decoupled frontend-backend architecture:

1. **Frontend (Next.js)**: Handles routing, UI rendering, internationalization (i18n), and state management. It communicates with the backend via secure, same-origin API calls (proxied to eliminate CORS).
2. **Backend (Express API)**: Manages business logic, authentication, authorization, database operations (MongoDB), and serves machine-readable error codes.
3. **Database (MongoDB)**: Stores user identities, sessions, venue data, and booking records.

```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│                 │       │                 │       │                 │
│   Next.js App   ├──────►│  Express API    ├──────►│     MongoDB     │
│  (Frontend/UI)  │       │ (Backend Domain)│       │ (Data Storage)  │
│                 │       │                 │       │                 │
└─────────────────┘       └─────────────────┘       └─────────────────┘
✨ Key Features
Advanced Authentication: Access/Refresh token strategy with token rotation, hashed token storage, and HTTP-only secure cookies.

Full Internationalization (i18n): Seamlessly supports Persian (default, RTL) and English (LTR, prefixed). UI translates backend error codes dynamically.

End-to-End Type Safety: Written entirely in TypeScript. Both frontend and backend share strict validation rules using Zod.

Robust Testing: Comprehensive test suites for both frontend (Vitest + Testing Library) and backend (Vitest + Supertest + Real in-memory MongoDB).

Containerized Environment: Ready-to-run with Docker Compose for a seamless local development experience.

🛠️ Tech Stack
Layer	Frontend	Backend
Core	Next.js 16 (App Router), React 19	Node.js 22, Express.js 5
Language	TypeScript (Strict)	JavaScript/TypeScript (ESM)
Styling/UI	Tailwind CSS, shadcn/ui, Lucide	-
State & Forms	React Context, React Hook Form	-
Validation	Zod v4	Zod v4
Database	-	MongoDB 7 (Mongoose)
Auth	Axios Interceptors (Refresh Token Rotation)	JWT, bcrypt, express-rate-limit
Testing	Vitest, Testing Library	Vitest, Supertest
DevOps	Docker, Docker Compose	Docker, Docker Compose
🚀 Getting Started (Docker)
The easiest way to run the entire stack (Frontend, Backend, and Database) is using Docker Compose.

Prerequisites
Docker and Docker Compose installed on your machine.

Quick Start
Clone the repository:

bash
git clone https://github.com/mokhtarizahra/My_Aura.git
cd My_Aura
Spin up the containers:

bash
docker compose up -d --build
Access the applications:

Frontend (Persian): http://localhost:3000

Frontend (English): http://localhost:3000/en

Backend API: http://localhost:5000 (or as configured in your env)

Note on Environment Variables: Ensure you have set up the .env files in both frontend/ and backend/ directories based on their respective README files before running Docker Compose.

📂 Repository Structure
This is a monorepo containing two primary applications:

text
My_Aura/
├── backend/                 # Express REST API
│   ├── src/
│   │   ├── services/        # Domain logic
│   │   ├── controllers/     # HTTP to domain translation
│   │   ├── models/          # Mongoose schemas
│   │   └── ...
│   ├── Dockerfile
│   └── README.md            # 🔗 Backend Documentation
│
├── frontend/                # Next.js App Router UI
│   ├── app/[locale]/        # Localized routes (RTL/LTR)
│   ├── components/          # UI & feature components
│   ├── context/             # Auth state management
│   ├── hooks/               # Custom API & logic hooks
│   ├── Dockerfile
│   └── README.md            # 🔗 Frontend Documentation
│
└── docker-compose.yml       # Orchestrates the full stack
📚 Documentation
For detailed information on each part of the application, please refer to their specific documentation:

📘 Backend README (./backend/README.md) — Learn about the database models, security measures (Rate Limiting, JWT rotation), API endpoints, and backend testing.

📙 Frontend README (./frontend/README.md) — Learn about the i18n architecture, route protection (proxy.ts), Axios interceptors, and UI components.

👤 Author
Zahra Mokhtari
GitHub: @mokhtarizahra

📄 License
Private — © My Aura.
