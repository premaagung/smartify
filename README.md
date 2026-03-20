# Smartify AI — LMS Learning Content Creation System

> **Tugas Akhir — ITB STIKOM Bali**
> "Integrasi Large Language Model (LLM) untuk Prototipe Sistem Pembuatan Konten Pembelajaran di Sekolah Pariwisata Mediterranean Bali"
>
> **Author:** A. A. Bagus Premananta Kumara (210030487)

---

## Overview

Smartify is an AI-powered Learning Management System (LMS) prototype that integrates Large Language Models (LLM) to automate the creation of learning content for Sekolah Pariwisata Mediterranean Bali. The system allows instructors to generate structured courses complete with curated YouTube videos, AI-generated summaries, and concept check quizzes — reducing manual content creation time from 3-4 hours per module to minutes.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 14.2.35 (App Router) + TypeScript |
| Database | MySQL (Aiven Cloud) + Prisma ORM 5.17.0 |
| Authentication | NextAuth v4 (Google OAuth + Email/Password) |
| AI / LLM | Gemini API (gemini-2.0-flash-lite) / OpenRouter |
| Video | YouTube Data API v3 |
| Images | Unsplash API |
| Styling | Tailwind CSS |
| State Management | TanStack Query + Axios |
| Password Hashing | bcryptjs |
| Containerization | Docker + docker-compose |
| CI/CD | GitHub Actions |
| Hosting | DigitalOcean Droplet |

---

## Features

### For Instructors
- **AI Course Creation** — Enter a topic and units, AI generates chapter structure, videos, summaries, and quizzes automatically
- **Manual Course Builder** — 4-step wizard to manually create chapters (Video → Summary → Quiz → Confirm)
- **Curriculum Alignment Review** — Generate content first, then review each chapter's alignment with school curriculum. Expand chapters to preview video, summary, and quiz. Rebuild non-aligned chapters manually
- **Edit Course** — Review and rebuild any existing course content via the alignment review flow
- **Delete Course** — Remove courses with confirmation dialog

### For Students
- **Course Viewer** — Watch curated YouTube videos and read AI-generated summaries per chapter
- **Concept Check Quiz** — Answer 5 multiple choice questions per chapter
- **Progress Tracking** — Quiz completion marks chapters as done, tracked per user
- **Dashboard** — Personal learning progress overview with per-course completion stats
- **Continue Learning** — Homepage card showing last accessed course with direct link to next chapter

---

## Prerequisites

- Node.js 18+
- npm
- MySQL database (or Aiven cloud MySQL)
- Docker (for containerized deployment)

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="mysql://user:password@host:port/dbname"

# NextAuth
NEXTAUTH_SECRET="your-random-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI / LLM
GEMINI_API_KEY="your-gemini-api-key"
# OR for development with OpenRouter:
OPENROUTER_API_KEY="your-openrouter-api-key"
OPENROUTER_MODEL="openrouter/hunter-alpha"

# YouTube Data API v3
YOUTUBE_API_KEY="your-youtube-api-key"

# Unsplash API
UNSPLASH_ACCESS_KEY="your-unsplash-access-key"
```

---

## Getting Started

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/premaagung/smartify.git
cd smartify

# 2. Install dependencies
npm install

# 3. Generate Prisma client
npx prisma generate

# 4. Push database schema
npx prisma db push

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Using Docker (Local)

```bash
# Copy env file
cp .env.example .env
# Fill in your environment variables

# Build and run with Docker Compose
docker compose up --build
```

App will be available at [http://localhost:3000](http://localhost:3000).

---

## Database Schema

```
User ──────────── Account (OAuth)
  │               Session
  └── UserChapterProgress ──── Chapter
                                  │
Course ── Unit ── Chapter ──── Question
```

Key model — `UserChapterProgress` tracks per-user quiz completion:
```prisma
model UserChapterProgress {
  userId    String
  chapterId String
  completed Boolean  @default(false)
  score     Int      @default(0)
  total     Int      @default(0)
  updatedAt DateTime @updatedAt

  @@unique([userId, chapterId])
}
```

---

## Project Structure

```
smartify/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Homepage (server component)
│   │   ├── auth/                       # Authentication page
│   │   ├── create/
│   │   │   ├── page.tsx                # Course creation form
│   │   │   └── [courseId]/page.tsx     # Curriculum alignment review
│   │   ├── course/[...slug]/           # Course viewer
│   │   ├── gallery/                    # Course gallery
│   │   ├── dashboard/                  # User progress dashboard
│   │   ├── settings/                   # User settings
│   │   └── api/
│   │       ├── course/
│   │       │   ├── createChapters/     # AI course structure generation
│   │       │   └── [courseId]/         # Course CRUD
│   │       ├── chapter/
│   │       │   ├── getInfo/            # AI chapter content generation
│   │       │   ├── completeChapter/    # Save quiz progress
│   │       │   ├── quizResult/         # Get previous quiz result
│   │       │   ├── generateQuiz/       # AI quiz generation
│   │       │   ├── summarizeVideo/     # AI summary generation
│   │       │   └── saveManual/         # Save manual chapter
│   │       └── youtube/search/         # YouTube video search
│   ├── components/
│   │   ├── ConfirmChapters.tsx         # Curriculum alignment review
│   │   ├── ChapterCard.tsx             # Chapter generation card
│   │   ├── ManualChapterModal.tsx      # Manual chapter builder
│   │   ├── QuizCards.tsx               # Quiz component
│   │   ├── CourseSideBar.tsx           # Course navigation sidebar
│   │   ├── GalleryCourseCard.tsx       # Gallery course card
│   │   ├── HomeClient.tsx              # Homepage client component
│   │   └── Navbar.tsx                  # Navigation bar
│   └── lib/
│       ├── gemini.ts                   # LLM integration (strict_output)
│       ├── youtube.ts                  # YouTube API
│       ├── unsplash.ts                 # Unsplash API
│       ├── auth.ts                     # NextAuth config
│       └── db.ts                       # Prisma client
├── prisma/
│   └── schema.prisma                   # Database schema
├── Dockerfile
├── docker-compose.yml
└── .github/
    └── workflows/
        └── ci-cd.yml                   # GitHub Actions pipeline
```

---

## CI/CD Pipeline

The GitHub Actions pipeline runs on every push to `main`:

```
Push to main
      ↓
Job 1: Run Tests (Jest)
      ↓
Job 2: Build & Push Docker image → ghcr.io
      ↓
Job 3: Deploy via SSH → DigitalOcean Droplet
```

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `DROPLET_IP` | DigitalOcean Droplet IP address |
| `DROPLET_USER` | SSH username (root) |
| `DROPLET_SSH_KEY` | Private SSH key for Droplet access |
| `DATABASE_URL` | Aiven MySQL connection string |
| `NEXTAUTH_SECRET` | NextAuth secret key |
| `NEXTAUTH_URL` | Production app URL |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GEMINI_API_KEY` | Gemini API key |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key |

---

## Deployment (DigitalOcean)

### 1. Create Droplet
- OS: Ubuntu 24.04 LTS
- Region: Singapore
- Size: $6/month (1GB RAM)

### 2. Setup Docker on Droplet
```bash
ssh root@YOUR_DROPLET_IP

apt-get update && apt-get install -y ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update && apt-get install -y docker-ce docker-ce-cli containerd.io
ufw allow 3000 && ufw allow OpenSSH && ufw --force enable
```

### 3. Add GitHub Secrets and Push
```bash
git push origin main
# GitHub Actions will automatically build and deploy
```

App will be live at `http://YOUR_DROPLET_IP:3000`

---

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage
```

Test cases cover:
- `strict_output` function (JSON parsing, code fence stripping, null sanitization)
- API routes (createChapters, completeChapter, quizResult)
- Utility functions (score calculation, YouTube search)

---

## API Rate Limits

| Service | Limit | Handling |
|---|---|---|
| Gemini API (free) | 15 req/min | Sequential 5s delay between chapters |
| YouTube Data API | 10,000 units/day | Search only (100 units/search) |
| Unsplash API | 50 req/hour | Fallback image on failure |

---

## Known Limitations

- YouTube search may return no results for very niche topics — use Edit Course → Rebuild to fix manually
- Gemini free tier rate limits cause slow generation — upgrade to paid plan for production
- No role-based access control (instructor vs student) — documented as future development

---

## Future Development

- Role-based access control (Instructor / Student / Admin)
- Admin user management panel
- Course publish/draft system
- Course progress certificates
- Mobile application
- Multi-language support

---

## License

This project is developed as an undergraduate thesis prototype at Institut Teknologi dan Bisnis (ITB) STIKOM Bali. All rights reserved.

---

## Acknowledgements

- Sekolah Pariwisata Mediterranean Bali — research location and stakeholder
- Google Gemini API — LLM provider
- ITB STIKOM Bali — academic institution
- Dosen Pembimbing: I Nyoman Rudy Hendrawan, S.Kom., M.Kom. and Ir. Putu Adi Guna Permana, S.Kom., M.Kom.