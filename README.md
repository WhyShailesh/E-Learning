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

```plaintext
learnova/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── seed/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── main.tsx
│   └── package.json
│
├── README.md
└── .gitignore
