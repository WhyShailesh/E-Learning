# Learnova - E-Learning Management System

A modern, full-stack Learning Management System (LMS) designed for scalable course delivery with role-based access for Learners, Instructors, and Administrators.

---

## Tech Stack

| Layer    | Stack |
|----------|--------|
| Frontend | React (Vite, TypeScript), TailwindCSS, Framer Motion, Axios |
| Backend  | Node.js, Express |
| Database | PostgreSQL |
| Auth     | JWT, role-based (Admin, Instructor, Learner) |
| Data     | Faker (for seeding demo data) |

---

## Features

- Authentication — Login/Register with JWT and role-based access  
- Learner Dashboard — Enrolled courses, progress tracking, ranking system  
- Course Management — Create, update, and manage courses  
- Lesson System — Video-based lessons with structured content delivery  
- Quiz System — Questions, options, scoring, and evaluation  
- Enrollment — Course access based on free or paid models  
- Admin Control — Manage users, courses, and platform-wide data  
- Analytics — Track performance, enrollments, and activity  

---

## Project Structure

learnova/
├── Learnova-backend/      # Express + PostgreSQL API
│   ├── config/
│   ├── routes/
│   ├── middleware/
│   ├── seed.js
│   └── server.js
├── learnova-app/          # React + Vite frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── contexts/
│       └── api/
├── README.md

---

## Quick Start

1. Setup Database — Create PostgreSQL DB and configure `.env`

2. Run Backend
cd Learnova-backend
npm install
node seed.js
npm run dev

3. Run Frontend
cd learnova-app
npm install
npm run dev

4. Login
Admin: admin@gmail.com / admin  
Other users: generated via seeder (password123)

---

## API Overview

| Method | Path | Description |
|--------|------|-------------|
| POST   | /api/auth/register | Register user |
| POST   | /api/auth/login    | Login |
| GET    | /api/auth/me       | Current user |
| GET    | /api/courses       | Get all courses |
| GET    | /api/courses/:id   | Course details |
| CRUD   | /api/lessons       | Manage lessons |
| CRUD   | /api/quizzes       | Manage quizzes |
| POST   | /api/enrollments   | Enroll in course |
| GET    | /api/dashboard     | Dashboard data |

All protected routes require:
Authorization: Bearer <token>

---

## Notes

- Seeder script generates:
  - 300+ learners  
  - 10 instructors  
  - 50 courses  
  - Lessons, quizzes, enrollments  

- Designed for demo-ready data and testing
