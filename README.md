<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=30&duration=3000&pause=1000&color=6C63FF&center=true&vCenter=true&width=700&lines=EduTech+AI+%F0%9F%A7%A0;Your+Personal+AI+Learning+Mentor;Adaptive+%7C+Intelligent+%7C+Personalized" alt="Typing SVG" />

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.13-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![SDG 4](https://img.shields.io/badge/SDG%204-Quality%20Education-C5192D?style=for-the-badge&logo=un&logoColor=white)](https://sdgs.un.org/goals/goal4)

<br/>

> **EduTech AI** is a production-grade, AI-powered personalized learning platform that acts as a digital mentor for every student — dynamically adapting roadmaps, predicting academic performance, tutoring in real-time, and visualizing algorithmic concepts through interactive simulations.

<br/>

[🚀 Quick Start](#-quick-start) · [🏗️ Architecture](#-architecture) · [✨ Features](#-features) · [📂 Project Structure](#-project-structure) · [🔑 Environment Variables](#-environment-variables) · [📖 API Reference](#-api-reference) · [🤝 Contributing](#-contributing)

---

</div>

## 📸 Screenshots

| Student Dashboard | AI Tutor Chat | Algorithm Lab |
|:-:|:-:|:-:|
| *Personalized 4-week roadmap* | *Real-time LangChain-powered tutor* | *Binary Search visualizer* |

---

## ✨ Features

<details open>
<summary><strong>🎓 Student Experience</strong></summary>

| Feature | Description |
|---------|-------------|
| **Adaptive Onboarding Survey** | Multi-step form that builds a rich learner profile — goals, weaknesses, interests, study habits, and career aspirations |
| **Personalized Roadmaps** | AI-generated 4-week curriculum tailored to each student's profile and current knowledge level |
| **Smart Resource Recommendations** | Binary Search–indexed resource catalogue ensures sub-20-comparison lookups across 1M+ items (`O(log N)`) |
| **Performance Prediction** | Random Forest classifier predicts grade category (A–F) and academic risk level based on learner metrics |
| **AI Tutor Chat** | 24/7 conversational tutor powered by LangChain + OpenAI GPT (with robust offline mocks) |
| **Adaptive Quizzes** | Dynamically generated quizzes based on current topic, with AI grading and gap analysis |

</details>

<details>
<summary><strong>🔬 Algorithmic Simulation Lab</strong></summary>

The **Decrease-and-Conquer Lab** (`/dashboard/lab`) is an interactive, step-by-step visual simulation:

- 📊 **Side-by-side comparison**: Linear Search `O(N)` vs Binary Search `O(log N)`
- 🎯 **Real-time pointer tracking**: Watch `low`, `mid`, and `high` bounds shrink at each step
- 📈 **Comparison counter**: Live counter showing total comparisons needed
- 📝 **Auto-graded worksheet**: AI evaluates complexity answers dynamically

</details>

<details>
<summary><strong>🛡️ Admin & Educator Dashboard</strong></summary>

- 📋 Classroom rosters with per-student performance metrics
- 🚨 Academic risk alerts (students predicted to score below threshold)
- 📊 Aggregated class averages and topic-wise weakness heatmaps
- 📤 Export-ready reports for institutional review

</details>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER                             │
│              Next.js 15 · React · TypeScript · Tailwind CSS         │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ HTTPS / REST
          ┌─────────────────▼──────────────────┐
          │         Spring Boot 3 API           │
          │   Java 21 · JWT Auth · Spring MVC   │
          │   Hibernate/JPA · Spring Security   │
          └──────┬─────────────────┬────────────┘
                 │                 │ Internal REST
          ┌──────▼──────┐  ┌──────▼──────────────────┐
          │  PostgreSQL  │  │  FastAPI AI Service      │
          │  (Docker)   │  │  Python 3.13 · scikit-   │
          │  or H2 File │  │  learn · LangChain/OpenAI│
          └─────────────┘  └──────────────────────────┘
```

### Technology Decisions

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 15 (App Router) | RSC, streaming, SEO, TypeScript-first |
| **Backend API** | Spring Boot 3 + Java 21 | Enterprise-grade security, virtual threads, JPA |
| **Authentication** | Stateless JWT | Scalable, session-free, microservice-compatible |
| **AI/ML Service** | FastAPI + scikit-learn | Fast async I/O for ML inference, Python ML ecosystem |
| **LLM Integration** | LangChain + OpenAI | Structured chains, offline mock fallback |
| **Database** | PostgreSQL / H2 | Production-grade (Docker) / Zero-config local (H2 file) |
| **Containerisation** | Docker + Compose | One-command full-stack deployment |

---

## 📂 Project Structure

```
EduTech-Ai/
│
├── 📁 backend/                          # Spring Boot REST API
│   ├── src/main/java/com/edutech/
│   │   ├── config/                      # Security, JWT filters, AI REST client config
│   │   ├── controller/                  # All REST Controllers (Auth, Student, Admin, Quiz)
│   │   ├── model/                       # JPA Entities (User, LearnerProfile, Quiz, etc.)
│   │   └── repository/                  # Spring Data JPA Repositories
│   ├── pom.xml                          # Maven dependency manifest
│   └── Dockerfile                       # Multi-stage Docker build
│
├── 📁 ai-service/                       # Python FastAPI AI Microservice
│   ├── main.py                          # REST endpoints + fallback mock logic
│   ├── model.py                         # Random Forest training & inference engine
│   ├── requirements.txt                 # Python dependencies
│   └── Dockerfile
│
├── 📁 frontend/                         # Next.js 15 Student/Admin Portal
│   ├── src/app/
│   │   ├── (auth)/                      # Login & registration pages
│   │   ├── onboarding/                  # Multi-step learner profile survey
│   │   ├── dashboard/                   # Student dashboard (roadmap, quizzes, tutor)
│   │   │   └── lab/                     # 🔬 Algorithmic Simulation Lab
│   │   └── admin/                       # Admin classroom management dashboard
│   ├── src/lib/                         # Typed API client wrappers
│   └── Dockerfile
│
├── docker-compose.yml                   # Full-stack orchestration (PostgreSQL + 3 services)
├── run-dev.bat                          # 🪟 Single-click Windows native runner
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Minimum Version | Installation |
|------|----------------|-------------|
| **Node.js** | 20.x LTS | [nodejs.org](https://nodejs.org) |
| **Java JDK** | 21 | [adoptium.net](https://adoptium.net) |
| **Python** | 3.10+ | [python.org](https://python.org) |
| **Maven** | 3.9+ | [maven.apache.org](https://maven.apache.org) |
| **Docker** | 24+ *(optional)* | [docker.com](https://www.docker.com) |

---

### Method A — 🐳 Docker Compose (Recommended)

The fastest path to a running full stack. All services + PostgreSQL start together.

```bash
# 1. Clone the repository
git clone https://github.com/guru-murtthy/EduTech-Ai.git
cd EduTech-Ai

# 2. (Optional) Set your OpenAI key for live AI responses
export OPENAI_API_KEY=sk-your-key-here

# 3. Start everything
docker-compose up --build

# Services will be available at:
#   Frontend  → http://localhost:3000
#   Backend   → http://localhost:8080
#   AI Service→ http://localhost:8000
#   DB (PostgreSQL) → localhost:5432
```

> **No OpenAI key?** No problem. The AI service automatically falls back to rich, pre-built offline mock responses for all AI features.

---

### Method B — 🖥️ Native Local (Windows)

If Docker isn't available:

```
Double-click  →  run-dev.bat
```

This opens three terminal windows:
1. **FastAPI AI Service** on `http://localhost:8000`
2. **Spring Boot API** on `http://localhost:8080` (H2 file DB auto-created at `./data/edutechdb`)
3. **Next.js Frontend** on `http://localhost:3000`

> Wait ~15 seconds for Maven compilation and Next.js build, then open `http://localhost:3000`.

---

### Method C — 🐧 Native Local (Linux / macOS)

```bash
# Terminal 1 — AI Service
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 — Backend API
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# Terminal 3 — Frontend
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Backend (`backend/src/main/resources/application-local.properties`)

```properties
spring.datasource.url=jdbc:h2:file:./data/edutechdb
spring.datasource.username=sa
spring.datasource.password=
app.jwt.secret=your-256-bit-secret
app.ai.service.url=http://localhost:8000
```

### AI Service (environment / `.env`)

```env
OPENAI_API_KEY=sk-your-key-here   # Optional — falls back to offline mocks
```

---

## 📖 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new student or admin |
| `POST` | `/api/auth/login` | Returns JWT access token |

### Student

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/student/profile` | Submit onboarding survey & build learner profile |
| `GET` | `/api/student/roadmap` | Fetch personalized learning roadmap |
| `GET` | `/api/student/resources` | Get AI-recommended resources |
| `POST` | `/api/student/quiz/generate` | Generate adaptive quiz for current topic |
| `POST` | `/api/student/quiz/submit` | Submit answers and receive AI feedback |

### AI Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/predict` | Predict grade & risk from learner metrics |
| `POST` | `/tutor/chat` | Send message to AI tutor (LangChain) |
| `POST` | `/quiz/grade` | AI-grade a submitted quiz |

---

## 🧪 Demo Walkthrough

1. **Open** `http://localhost:3000` → admire the glassmorphic dark-mode landing page
2. **Click** `Fast-Track Student Demo` → bypasses registration with a pre-seeded profile
3. **Onboarding** → complete the 4-step survey, select weaknesses like *"Algorithmic Complexity"*
4. **Student Dashboard** → view your personalized 4-week roadmap and the **Performance Prediction** card (`Risk: Low | Grade: B`)
5. **AI Tutor** → click the sidebar and ask *"Explain Binary Search complexity"*
6. **Algorithmic Lab** → set target `42`, run **Linear** (watch all comparisons), then **Binary** (watch bounds collapse in 3 steps), submit the worksheet
7. **Admin View** → log out, click `Fast-Track Admin Demo`, review classroom risk scores

---

## 🔬 Algorithmic Case Study — SDG 4 Integration

This project demonstrates how **Decrease-and-Conquer** algorithms directly empower quality education at scale:

| Algorithm | Complexity | Comparisons (1M items) | Use Case |
|-----------|-----------|------------------------|----------|
| Linear Search | `O(N)` | up to 1,000,000 | Naïve resource lookup |
| **Binary Search** | **`O(log N)`** | **≤ 20** | **EduTech AI resource retrieval** |

> By pre-indexing educational resources and applying Binary Search, EduTech AI returns perfectly matched content to students in milliseconds — making personalized quality education scalable to millions of learners.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

```bash
# 1. Fork the repo and create your branch
git checkout -b feature/amazing-feature

# 2. Commit your changes with a conventional commit message
git commit -m "feat: add amazing feature"

# 3. Push to your fork and open a Pull Request
git push origin feature/amazing-feature
```

Please make sure to:
- Follow existing code style and naming conventions
- Add tests for new backend endpoints
- Update this README if you add/change major features

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## 👤 Author

**Gururaj Murthy**
- GitHub: [@guru-murtthy](https://github.com/guru-murtthy)
- Project: [EduTech-Ai](https://github.com/guru-murtthy/EduTech-Ai)

---

<div align="center">

**Built with ❤️ for SDG 4: Quality Education**

*Making personalized, intelligent learning accessible to every student, regardless of background or learning style.*

⭐ **Star this repo** if EduTech AI inspired you!

</div>
