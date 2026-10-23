# 🚀 YojanaSethu (योजनासेतु)
### *Proof-Based Student Career Readiness & Placement Transparency Platform*

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Built for Nexathon 2026](https://img.shields.io/badge/Nexathon-2026-6366F1?style=for-the-badge)](https://github.com/Pranavr06/yojanasethu)

> **"Resumes show what students claim. YojanaSethu proves what they can do."**  
> Built for **Nexathon 2026** by **Team Neural Forge**.

---

## 📌 Executive Summary

Traditional campus placement ecosystems rely heavily on self-reported, unverified student resumes and fragmented institutional ERPs. This results in skill-gap mismatch, recruiter skepticism, and inefficient screening cycles.

**YojanaSethu** bridges the gap between academic institutions, students, faculty mentors, and corporate recruiters. It transforms static claims into **verifiable, evidence-backed proof**—synchronizing institutional Contineo ERP records, cryptographic skill passports, deterministic CGPA simulation, AI-driven career pathing, and transparent campus placement drives.

---

## 🌟 Core Architecture & Key Modules

```
                                  ┌──────────────────────────┐
                                  │   YOJANASETHU PLATFORM   │
                                  └─────────────┬────────────┘
                                                │
         ┌──────────────────┬───────────────────┼───────────────────┬──────────────────┐
         │                  │                   │                   │                  │
         ▼                  ▼                   ▼                   ▼                  ▼
  ┌──────────────┐   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   ┌──────────────┐
  │   STUDENT    │   │FACULTY MENTOR│    │  RECRUITER   │    │  PLACEMENT   │   │SYSTEM ADMIN  │
  │  WORKSPACES  │   │     DESK     │    │   PIPELINE   │    │     CELL     │   │  GOVERNANCE  │
  └──────────────┘   └──────────────┘    └──────────────┘    └──────────────┘   └──────────────┘
```

### 1. 🎓 Student Career Workspace
* **Contineo Academic Records** (`/student/academic-truth`): Immutable ERP grade synchronization, SGPA trajectory, and semester credit logs.
* **CGPA Simulation Planner** (`/student/cgpa-calculator`): Deterministic credit simulator allowing students to model prospective grades to hit cutoff thresholds.
* **Verifiable Skill Passport** (`/student/skill-passport`): Cryptographically verifiable skill credentials backed by faculty endorsement and live GitHub repository evidence.
* **Certificates & Evidence Desk** (`/student/certificates`): Direct credential upload (PDF/PNG/JPG) with automated routing to mentor verification desks.
* **AI Career Coach** (`/student/career-coach`): Target role pathing (AI Engineer, Full-Stack, Cloud/DevOps, Data Science), placement readiness scoring, and skill-gap radar.
* **30-Day Targeted Roadmap** (`/student/roadmap`): Structured, milestone-driven weekly curriculum tailored for Tier 1 campus drives.
* **AI Resume Builder** (`/student/resume-builder`): Real-time ATS-friendly resume canvas with ERP auto-fill and instant PDF export.
* **DSA Practice Tracker** (`/student/dsa-tracker`): Checklist of 20 core algorithmic patterns asked in Tier 1 technical interviews (Sliding Window, Dynamic Programming, Graphs) with local persistence.
* **Learn Programming** (`/student/learn-programming`): Interactive placement tracks across Python, Java, C++, and TypeScript with syntax cheatsheets.
* **Placement Transparency Hub** (`/student/placement-hub`): Real-time drive calendar, eligibility verification, announcements, and direct applications.
* **Historical Placement Analytics** (`/student/placement-history`): Verified institutional salary benchmarks, top recruiters, and departmental statistics.

### 2. 👨‍🏫 Faculty Mentor Desk
* **Evidence Verification Desk** (`/mentor/verifications`): Audit submitted student credentials, inspect GitHub source code, and cryptographically endorse skills.
* **ERP Correction Desk** (`/mentor/corrections`): Review student grade discrepancy tickets before syncing with the central ERP.
* **Mentee Directory & Cohort Analytics** (`/mentor/mentees`, `/mentor/analytics`): Track branch-wise skill gaps, low-credit alerts, and placement eligibility.

### 3. 🏢 Corporate Recruiter Pipeline
* **Ranked Candidate Search** (`/recruiter`): Filter candidates by verified Contineo CGPA, confirmed technical skills, and endorsed projects.
* **Drive Management** (`/recruiter/jobs`): Post recruitment drives, specify exact cutoff criteria, and evaluate shortlisted applicant pools.

### 4. 🎯 Placement Cell (TPO)
* **Campus Drives & Transparency** (`/placement`): Schedule multi-round campus drives, publish official circulars, and monitor real-time company cutoffs.
* **Student Offer Tracking**: Track active offers, single-offer compliance, and department placement percentages.

### 5. 🛡️ System Administration & RBAC
* **Role Approvals** (`/admin/dashboard`): Secure verification and onboarding of incoming faculty, recruiters, and placement officers.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14 (App Router)** | Server Components, Route Handlers, Server-Side Rendering (SSR) |
| **Language** | **TypeScript 5.x** | End-to-end type safety, strict interface models |
| **Styling** | **Tailwind CSS 3.4** | Modern responsive design with native light/dark mode class toggle |
| **Icons** | **Lucide React** | Clean, accessible SVG iconography |
| **Database** | **Supabase (PostgreSQL)** | Relational schema, JSONB capabilities, Row Level Security (RLS) |
| **Authentication** | **Supabase Auth & SSR** | Cookie-based session validation via `@supabase/ssr` with middleware protection |
| **Storage** | **Supabase Storage** | Document bucket (`documents`) for PDF/image certificate evidence |
| **AI Engine** | **Google Gemini API** | Intelligent resume parsing, career guidance, and skill extraction |

---

## 📁 Project Directory Structure

```plaintext
yojanasethu/
├── public/                     # Static assets and icons
├── src/
│   ├── app/
│   │   ├── (auth)/             # Authentication routes
│   │   │   ├── login/          # Role-based login with persona selector
│   │   │   ├── signup/         # Account registration
│   │   │   └── forgot-password/# Secure password recovery
│   │   ├── admin/              # System governance & role approvals
│   │   ├── mentor/             # Faculty mentor verification & analytics
│   │   ├── placement/          # Training & Placement Officer (TPO) portal
│   │   ├── recruiter/          # Recruiter talent discovery & candidate pipeline
│   │   ├── student/            # Dedicated student workspaces
│   │   │   ├── academic-truth/ # Contineo ERP verified grade records
│   │   │   ├── career-coach/   # AI career guidance & placement readiness
│   │   │   ├── certificates/   # Uploaded credentials & evidence review
│   │   │   ├── cgpa-calculator/# Deterministic grade simulation
│   │   │   ├── dsa-tracker/    # Algorithmic interview patterns tracker
│   │   │   ├── learn-programming/ # Multi-language programming tracks
│   │   │   ├── placement-history/ # Historical compensation & company records
│   │   │   ├── placement-hub/  # Live campus drives & transparent announcements
│   │   │   ├── resume-builder/ # ATS resume builder with live preview
│   │   │   ├── roadmap/        # 30-day weekly preparation schedule
│   │   │   └── skill-passport/ # Cryptographic evidence-backed skill passport
│   │   ├── api/                # Next.js Serverless Route Handlers
│   │   │   ├── auth/           # Login, register, session endpoints
│   │   │   ├── evidence/       # Evidence submission & verification API
│   │   │   ├── placement/      # Drives, calendar, announcements, stats
│   │   │   ├── students/       # Academic records & profile data
│   │   │   └── upload/         # Multipart file upload to storage bucket
│   │   ├── layout.tsx          # Root HTML layout with providers
│   │   └── globals.css         # Global Tailwind styles & dark mode definitions
│   ├── components/             # Reusable UI components
│   │   ├── AppShell.tsx        # Persistent responsive layout wrapper
│   │   ├── Sidebar.tsx         # Role-aware unified navigation
│   │   └── NotificationBell.tsx# Dismissible real-time notification center
│   ├── lib/                    # Core application libraries
│   │   ├── authContext.tsx     # Client-side authentication state
│   │   ├── themeContext.tsx    # Synchronized dark/light mode provider
│   │   ├── db.ts               # Database query layer & Supabase client
│   │   ├── storage.ts          # Storage bucket interface with auto-create
│   │   └── rbac.ts             # Role-Based Access Control route definitions
│   ├── middleware.ts           # Route protection & session enforcement
│   └── types/                  # TypeScript interface definitions
├── .env.example                # Template environment variables
├── tailwind.config.ts          # Tailwind configuration (darkMode: "class")
├── tsconfig.json               # TypeScript compiler rules
└── package.json                # Project dependencies and build scripts
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
* **Node.js**: `v18.17.0` or higher
* **npm** or **pnpm** installed
* A free **[Supabase](https://supabase.com/)** account and project

### 2. Clone the Repository
```bash
git clone https://github.com/Pranavr06/yojanasethu.git
cd yojanasethu
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy the template environment file:
```bash
cp .env.example .env.local
```

Open `.env.local` and add your project credentials:
```env
# 1. Supabase PostgreSQL & Storage Configuration (From Supabase Dashboard -> Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key...

# 2. REQUIRED FOR SERVER-SIDE ADMIN OPERATIONS & FILE UPLOADS:
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...your-service-role-key...

# 3. Supabase Storage Bucket Name (Default: documents)
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=documents

# 4. Optional: Google Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# 5. Application Host URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Supabase Storage Setup
In your **Supabase Dashboard**:
1. Go to **Storage** in the left sidebar.
2. Click **New bucket**, name it `documents`, and ensure **Public bucket** is enabled.
3. *(Optional)* If not using `SUPABASE_SERVICE_ROLE_KEY`, run this SQL in your **SQL Editor** to allow uploads:
   ```sql
   CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'documents');
   CREATE POLICY "Allow public read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'documents');
   ```

### 6. Run Development Server
```bash
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser. The default root route opens the login screen with pre-configured persona options for evaluation.

---

## 🔒 Security & RBAC Implementation

* **Cryptographic Session Cookies**: Managed seamlessly via `@supabase/ssr` to prevent token tampering.
* **Server-Side Role Guard**: Next.js `middleware.ts` inspects encrypted session cookies and denies unauthorized traversal across role boundaries (e.g. students cannot access `/admin` or `/mentor`).
* **Storage Isolation**: User uploaded documents are scoped with unique timestamps and sanitized naming schemas to prevent directory traversal and overwrite attacks.
* **Protection against Role Spoofing**: Critical role requests are validated server-side against authorized system administrators.

---

## 🧪 Testing & Production Build

Ensure all TypeScript types and static routes pass compilation:

```bash
# Type checking
npx tsc --noEmit

# Production build
npm run build

# Start production server
npm run start
```

---

## 👥 Team Neural Forge (Nexathon 2026)

| Member | Role & Specialization | GitHub | Primary Contributions |
| :--- | :--- | :--- | :--- |
| **Pranav R** | **Lead Full-Stack Architect & Core Platform Engine** | [@Pranavr06](https://github.com/Pranavr06) | Core Next.js 14 App Router, 5-Role RBAC & Supabase SSR Auth, Multi-Page Student Hub, CGPA Simulator, Storage Engine |
| **Prathwik Shetty** | **Student Intelligence & Conversational AI Lead** | [@prathwik-shetty](https://github.com/prathwik-shetty) | AI Voice Mock Interview Assistant, Real-Time Audio Assessment, Student Dashboard UI Layouts, Build Pipeline |
| **Preethika Poojary** | **Placement Transparency & Verification Workflow Lead** | [@Preethika](https://github.com/preethikapoojary) | Placement Transparency Hub, End-to-End Certificate Assessment, Drive Calendar & Eligibility Auditing, Retake Desk |
| **Prajwala Gouda** | **Recruiter Talent Portal & Candidate Intelligence Lead** | [@prajwalagouda](https://github.com/prajwalagouda) | Recruiter Talent Pipeline, Candidate Ranking & Profile Inspection Modal, Database Schemas, Cutoff Filter Engine |

---

### 🔬 Detailed Contribution Analysis (Based on Git History)

#### 1. **Pranav R** — *Lead Full-Stack Architect & Core Platform Engine*
* **Core Architecture & Routing**: Engineered the Next.js 14 App Router architecture, server-side data access layer (`src/lib/db.ts`), and unified responsive layout shell (`AppShell.tsx` and `Sidebar.tsx`).
* **5-Role RBAC & Supabase Auth**: Built the authentication ecosystem with cookie-based SSR sessions (`@supabase/ssr`), role-protected Next.js middleware, password recovery, and login persona validation against server-side role spoofing.
* **Student Multi-Page Modularization**: Converted in-page monolithic dashboard tabs into standalone App Router routes:
  * **AI Resume Builder** (`/student/resume-builder`): Real-time ATS-friendly canvas with ERP profile auto-fill and PDF print engine.
  * **AI Career Coach** (`/student/career-coach`): Target role guidance, placement readiness prediction, and skill-gap radar.
  * **Learn Programming** (`/student/learn-programming`): Multi-language interactive curriculum (Python, Java, C++, TypeScript).
  * **DSA Practice Tracker** (`/student/dsa-tracker`): Algorithmic interview pattern checklist with persistent progress tracking.
  * **Certificates & Evidence** (`/student/certificates`): Evidence upload with status badges and verification desk links.
  * **Historical Placement Analytics** (`/student/placement-history`): Campus compensation benchmarks and department statistics.
* **Storage Resilience & UI Polish**: Implemented automatic Supabase storage bucket creation (`documents`), multi-format credential upload (PDF/PNG/JPG/WebP), theme switcher class synchronization, and notification center cleanups.

#### 2. **Prathwik Shetty** — *Student Intelligence & Conversational AI Lead*
* **AI Voice Mock Interview Assistant** (`/student/mock-interview`): Developed the conversational voice mock interview assistant enabling students to simulate technical and behavioral campus placement interviews.
* **Multi-Metric Scoring Scorecard**: Implemented real-time audio evaluation with structured scorecards covering communication clarity, technical depth, and interview confidence.
* **Student Dashboard Foundations**: Built the initial student career portal layouts, component structures, and modularized navigation links.
* **Build Engineering & Integration**: Configured TypeScript path aliases (`baseUrl`), handled Next.js 404 error boundaries, resolved complex cross-branch merge conflicts, and streamlined session controls.

#### 3. **Preethika Poojary** — *Placement Transparency & Verification Workflow Lead*
* **Placement Transparency Hub** (`/student/placement-hub` & `/placement`): Spearheaded the campus placement transparency system featuring live drive calendars, official announcements, cutoff criteria, and eligibility auditing.
* **End-to-End Certificate Assessment Workflow**: Architected the complete certificate verification and automated assessment pipeline, featuring attempt tracking, objective evaluation questions, and faculty retake authorization desks.
* **Eligibility & Cutoff Verification**: Built deterministic academic cutoff filters cross-referencing live student SGPA/CGPA with company recruitment criteria.
* **Release & Branch Synchronization**: Managed placement dashboard feature branches, PR integrations (`#5`, `#9`, `#15`), and database type alignments.

#### 4. **Prajwala Gouda** — *Recruiter Talent Portal & Candidate Intelligence Lead*
* **Recruiter Talent Discovery Pipeline** (`/recruiter` & `/recruiter/dashboard`): Designed the talent scouting desk allowing corporate recruiters to post jobs, search ranked candidates, and manage campus pipelines.
* **Candidate Profile Modal**: Built the comprehensive candidate inspection modal (`StudentProfileModal.tsx`), giving recruiters deep visibility into student Contineo grades, verified skills, and endorsed projects.
* **Database & Schema Modeling**: Implemented database schema refinements, typing corrections, and candidate filtering algorithms based on departmental cutoffs and skill endorsements.
* **Pipeline Integration**: Led the recruiter feature branch (`#6`), PR reviews, and recruiter-to-student application flows.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE). Built with pride for **Nexathon 2026**.
