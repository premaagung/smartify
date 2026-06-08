# Smartify — AI-Powered LMS Content Creation System

> **Tugas Akhir — ITB STIKOM Bali**
> "Integrasi Large Language Model (LLM) untuk Prototipe Sistem Pembuatan Konten Pembelajaran di Sekolah Pariwisata Mediterranean Bali"
>
> **Author:** A. A. Bagus Premananta Kumara (210030487)
> **Live:** http://167.71.218.16:3000

---

## Overview

Smartify is an AI-powered Learning Management System (LMS) prototype that integrates Google Gemini to automate the creation of structured learning content for Sekolah Pariwisata Mediterranean Bali. Instructors can generate complete courses — including curated YouTube videos, AI-generated summaries, and concept-check quizzes — reducing manual content creation time by up to **80.74%** compared to traditional methods.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 14.2.35 (App Router) + TypeScript |
| Database | MySQL (Aiven Cloud) + Prisma ORM 5.17.0 |
| Authentication | NextAuth v4 (Google OAuth + Email/Password) |
| AI / LLM | Google Gemini API (`gemini-2.5-flash`) |
| Video | YouTube Data API v3 |
| Images | Unsplash API |
| Styling | Tailwind CSS + next-themes |
| State Management | TanStack Query + Axios |
| Password Hashing | bcryptjs |
| Containerization | Docker 29.5.3 + docker-compose |
| CI/CD | GitHub Actions (3-job pipeline) |
| Hosting | DigitalOcean Droplet SGP1 ($16/month) |

---

## Features

### For Instructors
- **AI Course Creation** — Enter a topic and number of units; Gemini generates chapter structure, YouTube videos, summaries, and quizzes automatically
- **Manual Course Builder** — 4-step wizard: Video → Summary → Quiz → Confirm
- **Curriculum Alignment Review** — Review each AI-generated chapter against school curriculum. Expand to preview video + summary + quiz inline. Rebuild non-aligned chapters manually via the Manual Course Builder
- **Edit Course** — Pencil icon on gallery card → opens alignment review flow for any existing course
- **Delete Course** — Trash icon with confirmation dialog

### For Students
- **Course Viewer** — Watch curated YouTube videos with AI-generated summaries per chapter
- **Concept Check Quiz** — 5 multiple choice questions per chapter (4 options)
- **Progress Tracking** — Quiz completion marks chapters as done, tracked per user
- **Dashboard** — Personal learning stats: chapters completed, quiz scores, per-course progress
- **Continue Learning** — Homepage card linking directly to the next incomplete chapter
- **Settings** — Account info, learning progress overview, quiz performance stats

---

## Prerequisites

- Node.js 18+
- npm
- MySQL database (local or Aiven Cloud)
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
GEMINI_MODEL="gemini-2.5-flash"

# YouTube Data API v3
YOUTUBE_API_KEY="your-youtube-api-key"

# Unsplash API
UNSPLASH_ACCESS_KEY="your-unsplash-access-key"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
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
│   │   ├── auth/page.tsx               # Authentication page
│   │   ├── create/
│   │   │   ├── page.tsx                # AI course creation form
│   │   │   └── [courseId]/page.tsx     # Curriculum alignment review + edit
│   │   ├── course/[...slug]/           # Course viewer
│   │   ├── gallery/page.tsx            # Course gallery with progress
│   │   ├── dashboard/page.tsx          # Personal learning dashboard
│   │   ├── settings/page.tsx           # Account + learning stats
│   │   └── api/
│   │       ├── auth/register/          # Email/password registration
│   │       ├── course/
│   │       │   ├── createChapters/     # AI course structure generation
│   │       │   └── [courseId]/         # Course delete
│   │       ├── chapter/
│   │       │   ├── getInfo/            # AI chapter content (summary + quiz)
│   │       │   ├── completeChapter/    # Save quiz progress
│   │       │   ├── quizResult/         # Get previous quiz result
│   │       │   ├── generateQuiz/       # Manual quiz generation
│   │       │   ├── summarizeVideo/     # Manual summary generation
│   │       │   └── saveManual/         # Save manual chapter
│   │       └── youtube/search/         # YouTube video search
│   ├── components/
│   │   ├── ConfirmChapters.tsx         # Curriculum alignment review UI
│   │   ├── ChapterCard.tsx             # Chapter generation card (AI + Manual)
│   │   ├── ManualChapterModal.tsx      # 4-step manual chapter wizard
│   │   ├── QuizCards.tsx               # Quiz UI with previous attempt banner
│   │   ├── CourseSideBar.tsx           # Course navigation + progress
│   │   ├── GalleryCourseCard.tsx       # Gallery card with edit/delete
│   │   ├── HomeClient.tsx              # Continue learning (client)
│   │   ├── AuthForm.tsx                # Login/register form
│   │   ├── Navbar.tsx                  # Navigation + theme toggle
│   │   ├── ThemeToggle.tsx             # Light/dark mode toggle
│   │   └── ui/                         # shadcn/ui components
│   └── lib/
│       ├── gemini.ts                   # Gemini SDK (strict_output, cleanJSON)
│       ├── youtube.ts                  # YouTube API search
│       ├── unsplash.ts                 # Unsplash image fetch with fallback
│       ├── auth.ts                     # NextAuth config
│       ├── db.ts                       # Prisma client singleton
│       └── utils.ts                    # Utility functions
├── prisma/schema.prisma                # Database schema
├── __tests__/smartify.test.ts          # Jest unit tests
├── Dockerfile                          # Multi-stage build (output: standalone)
├── docker-compose.yml
└── .github/workflows/ci-cd.yml         # 3-job CI/CD pipeline
```

---

## CI/CD Pipeline

Runs automatically on every push to `main`:

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
| `DROPLET_IP` | DigitalOcean Droplet IP |
| `DROPLET_USER` | SSH username (`root`) |
| `DROPLET_SSH_KEY` | Private SSH key |
| `DATABASE_URL` | Aiven MySQL connection string |
| `NEXTAUTH_SECRET` | NextAuth secret |
| `NEXTAUTH_URL` | Production URL |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GEMINI_API_KEY` | Gemini API key |
| `GEMINI_MODEL` | Gemini model name |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key |
| `UNSPLASH_ACCESS_KEY` | Unsplash API key |

---

## Deployment (DigitalOcean)

### 1. Create Droplet
- OS: Ubuntu 24.04 LTS
- Region: Singapore (SGP1)
- Size: Premium Intel $16/month

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

### 3. Push to Deploy

```bash
git push origin main
# GitHub Actions builds and deploys automatically
```

---

## Testing

```bash
# Run all tests
npm test

# Run with coverage report
npm test -- --coverage
```

Test cases cover:
- `strict_output` — JSON parsing, code fence stripping, null sanitization
- API routes — `createChapters`, `completeChapter`, `quizResult`
- Utility functions — score calculation, YouTube search

---

## API Rate Limits

| Service | Free Tier Limit | Handling |
|---|---|---|
| Gemini API | 15 req/min | Sequential generation per chapter |
| YouTube Data API | 10,000 units/day | 100 units per search |
| Unsplash API | 50 req/hour | Throws error on failure, no broken images saved |

---

## Known Limitations

- YouTube search may return no results for very niche topics — use Edit Course to rebuild manually
- Gemini free tier rate limits cause slower generation — upgrade to paid tier for production scale
- No role-based access control (instructor vs student) — documented as future development in BAB V

---

## Future Development

- Role-based access control (Instructor / Student / Admin)
- Admin user management panel
- Course publish/draft system
- Completion certificates
- Mobile application
- Multi-language support (Bahasa Indonesia)

---

## License

Developed as an undergraduate thesis prototype at Institut Teknologi dan Bisnis (ITB) STIKOM Bali. All rights reserved.

---

## Acknowledgements

- **Sekolah Pariwisata Mediterranean Bali** — research location and evaluation stakeholder
- **Google Gemini API** — LLM provider
- **ITB STIKOM Bali** — academic institution
- **Dosen Pembimbing:** I Nyoman Rudy Hendrawan, S.Kom., M.Kom. dan Ir. Putu Adi Guna Permana, S.Kom., M.Kom.
