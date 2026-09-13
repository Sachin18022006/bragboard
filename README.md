# 🚀 BragBoard - Enterprise Peer Recognition & Rewards Platform

[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)](./DOCKER_GUIDE.md)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**BragBoard** is a modern, full-stack employee recognition platform engineered to boost team engagement, celebrate workplace wins, and deliver actionable engagement analytics for management.

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

- **Frontend**: React 18, Nginx, Lucide Icons, Canvas-Confetti, Custom Design System
- **Backend**: FastAPI, Python 3.11, SQLAlchemy ORM, Pydantic v2, Uvicorn
- **Database**: PostgreSQL 15 (Alpine) with persistent volume management
- **Authentication**: Stateless JWT (`python-jose`) with bcrypt password hashing
- **DevOps**: Docker, Docker Compose, Multi-stage builds

---

## ⚡ Quick Start with Docker

The fastest way to run BragBoard is with Docker Compose:

```bash
# 1. Clone the repository
git clone https://github.com/Sachin18022006/bragboard.git
cd bragboard

# 2. Build and launch all containers
docker compose up --build -d
```

### Access Ports:
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Interactive API Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Database**: Port `5432`

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Access Highlights |
| :--- | :--- | :--- | :--- |
| **Super Admin / Employee** | `sachin12345@gmail.com` | `0987654321` | Admin Console, Moderation Queue, Analytics & Feed |
| **Administrator** | `Adam123@gmail.com` | `12345` | Management Admin, Moderation & Reports |
| **Employee** | `Ananya123@gmail.com` | `123` | Employee Shoutouts, Reactions & Profile |

*For complete Docker lifecycle commands and troubleshooting, see the [Docker Deployment Guide](./DOCKER_GUIDE.md).*

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
