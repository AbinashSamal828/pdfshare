# PDFShare

PDFShare is a full-stack web application for uploading, sharing, and commenting on PDF documents. It features secure authentication, granular sharing (by email or public link), and real-time commenting for both registered users and guests.

---

## Table of Contents

- [PDFShare](#pdfshare)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Architecture](#architecture)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Environment Variables](#environment-variables)
      - [Backend](#backend)
      - [Frontend](#frontend)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup](#frontend-setup)
  - [Deployment](#deployment)
  - [Database Schema](#database-schema)
  - [API Overview](#api-overview)
  - [Contributing](#contributing)

---

## Features

- **User Authentication:** Secure registration and login with JWT.
- **PDF Upload:** Upload PDFs, stored in AWS S3.
- **Sharing:** Share PDFs with other users by email or generate a public link.
- **Commenting:** Add comments to PDFs, with support for Markdown formatting.
- **Guest Access:** Publicly shared PDFs allow guest comments with a name.
- **Dashboard:** View your uploaded and shared PDFs.
- **Responsive UI:** Modern, mobile-friendly interface.

---

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite, React Router, React PDF, Axios
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, AWS S3
- **Authentication:** JWT (JSON Web Tokens)
- **Deployment:** Docker, Vercel (frontend), any cloud provider (backend)

---

## Architecture

```mermaid
graph TD
  A["React Frontend"] -- "REST API" --> B["Express Backend"]
  B -- "Prisma" --> C[("PostgreSQL")]
  B -- "S3 SDK" --> D[("AWS S3")]
  B -- "JWT" --> E["Auth"]
```

---

## Getting Started

### Prerequisites

- Node.js (v20+)
- npm
- PostgreSQL database
- AWS S3 bucket (for PDF storage)
- Docker (optional, for containerized deployment)

### Environment Variables

#### Backend

Create a `.env` file in `backend/` with:

```
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_bucket_name
FRONTEND_URL=frontend_url
PORT=port
```

#### Frontend

If you need to configure API endpoints, create a `.env` in `frontend/`:

```
VITE_API_URL=http://localhost:3000
```

### Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy # or migrate dev for local development
npm run build
npm start
```

Or, using Docker:

```bash
docker build -t pdfshare-backend .
docker run -p 3000:3000 --env-file .env pdfshare-backend
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

For production build:

```bash
npm run build
npm run preview
```

---

## Deployment

- **Frontend:** Deploy `frontend/` to Vercel, Netlify, or any static host.
- **Backend:** Deploy `backend/` to your preferred cloud provider (e.g., AWS, DigitalOcean, Heroku) or use Docker.
- **Database:** Provision a managed PostgreSQL instance.
- **Storage:** Use AWS S3 for PDF storage.

---

## Database Schema

The backend uses Prisma ORM. Main models:

- **User:** id, name, email, password, owned PDFs, shared PDFs, comments
- **Pdf:** id, filename, s3Url, owner, sharedWith, comments, createdAt, shareToken
- **Comment:** id, pdf, user (nullable), guestName, pageNumber, text, createdAt

See `backend/prisma/schema.prisma` for details.

---

## API Overview

- `POST /auth/register` — Register a new user
- `POST /auth/login` — Login and receive JWT
- `POST /pdf/upload` — Upload a PDF (authenticated)
- `GET /pdf/pdfs` — List owned/shared PDFs (authenticated)
- `POST /pdf/:id/share` — Share PDF with another user by email
- `POST /pdf/:id/generate-share-link` — Generate a public share link
- `GET /pdf/:id/view-url` — Get signed S3 URL for viewing
- `GET /comments/:pdfId/comments` — Get comments for a PDF
- `POST /comments/:pdfId/comment` — Add a comment (authenticated)
- `GET /public/pdf/:shareToken` — Get public PDF info
- `GET /public/comments/:shareToken` — Get public comments
- `POST /public/comments/:shareToken` — Add guest comment

---

## Contributing

1. Fork the repo and create your branch.
2. Make your changes and add tests if applicable.
3. Run lint and tests.
4. Submit a pull request.
