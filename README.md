# 🚀 BragBoard - Enterprise Peer Recognition & Rewards Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-bragboard--phi.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://bragboard-phi.vercel.app/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)](./DOCKER_GUIDE.md)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> 🌐 **Live Production App**: **[https://bragboard-phi.vercel.app](https://bragboard-phi.vercel.app/)**  
> Deployed 24/7 with a React frontend on **Vercel** and a FastAPI backend with PostgreSQL on **Render**.

---

## ✨ Standout Features

- 🏆 **Peer Recognition Feed**: Interactive shoutout feed with hashtags, department tagging, reactions (🔥, 👏, ❤️, 💡), and threaded comments.
- 📊 **Real-time Analytics**: Department-level engagement ratios, weekly recognition trends, and active contributor metrics.
- 🛡️ **Admin & Moderation Console**: Dedicated admin suite to audit flagged posts, review complaints, and monitor platform health.
- 🏅 **Dynamic Leaderboard**: Gamified rankings showcasing top recognized contributors and high-velocity teams.
- 🔔 **Instant Notification Center**: Real-time alerts for incoming shoutouts, peer reactions, and comments.
- 🌓 **Dark & Light Mode**: Fluid, high-contrast theme engine designed for accessibility and visual appeal.
- 🐳 **Full Docker Architecture**: 1-command reproducible multi-container deployment using Docker & Docker Compose.

---

## 🏗️ Tech Stack & Architecture

- **Frontend**: React 18, Nginx (local) / Vercel (cloud), Lucide Icons, Canvas-Confetti
- **Backend**: FastAPI, Python 3.11, SQLAlchemy ORM, Pydantic v2, Uvicorn
- **Database**: PostgreSQL 15 with persistent volume management
- **Authentication**: Stateless JWT (`python-jose`) with bcrypt password hashing
- **DevOps**: Docker, Docker Compose, Multi-stage builds, Vercel SPA deployment

---

## 🌐 Live Access & Local Deployment

### 1. Live Cloud Application
- **Frontend (Vercel)**: **[https://bragboard-phi.vercel.app](https://bragboard-phi.vercel.app/)**
- **Backend API Docs (Swagger)**: https://bragboard-79qp.onrender.com/docs

---

### 2. Local Setup with Docker (Alternative)
The entire stack can also be run locally with one command:

```bash
# Clone the repository
git clone https://github.com/Sachin18022006/bragboard.git
cd bragboard

# Build and launch all containers
docker compose up --build -d
```

- **Local Frontend**: [http://localhost:3000](http://localhost:3000)
- **Local Swagger API Docs**: https://bragboard-79qp.onrender.com/docs
- **Local PostgreSQL**: Port `5432`

*For complete Docker lifecycle commands, configuration, and troubleshooting, see the [Docker Deployment Guide](./DOCKER_GUIDE.md).*

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
