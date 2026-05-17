# Task Tracker

A full-stack project and task management web app built with Next.js. Supports team organizations, hierarchical projects → tasks → subtasks, drag-and-drop reordering, AI-powered task generation via Gemini, a gamified points system, and Stripe-based subscriptions.

## Features

### Authentication
- Email/password sign-up and login with bcrypt password hashing
- OAuth login via **Google** and **GitHub**
- Session management via JWT (NextAuth v5 with Prisma adapter)
- Protected routes enforced by Next.js middleware

### Organizations & Projects
- Create organizations and invite members with **ADMIN** or **MEMBER** roles
- Each organization can have multiple projects
- Project fields include name, description, goal, focus area, and main goal
- Guided onboarding modal walks new users through creating their first organization and project

### Tasks & Subtasks (Three-Level Hierarchy)
- Projects contain **Tasks**; tasks contain **Subtasks**
- Subtasks support:
  - Assignment to team members
  - Due dates
  - Priority levels
  - Tags (name + color)
  - Status (`pending` / `completed`)
  - Points earned on completion
  - Comments (with `resolved` state)

### Drag-and-Drop Reordering
Powered by **@dnd-kit** (core + sortable). Sort order is stored per-user via separate sort-index models (`ProjectSortIndex`, `TaskSortIndex`, `SubtaskSortIndex`), so each member can have a personalized view order.

Drag-and-drop is available for:
- Project cards on the dashboard
- Task items within a project

### AI Integration (Google Gemini)
The app uses `gemini-2.0-flash-001` via `@google/generative-ai` for two features:

1. **Task suggestions** — given a project name and description, Gemini suggests 3–5 starter tasks
2. **Subtask generation** — given a project and task context, Gemini breaks a task into 3–5 actionable subtasks

Suggested tasks are stored in `AISuggestedTask` and displayed inline; users can accept (add to project) or dismiss each suggestion. The app supports up to three Gemini API keys with automatic rotation.

### Project Insights & Summaries
- Gemini also generates **project insights** (key observations) and **desired outcomes** from the current task/subtask data
- A `ProjectSummary` model caches the latest AI-generated summary with done/pending breakdowns

### Points & Gamification
- Each subtask has a configurable point value (default: 10)
- Completing a subtask awards points to the assigned user
- A `/points` dashboard shows points earned per user across projects
- An `/allpoints` leaderboard is available organization-wide

### Views
- **List view** — expandable task rows with sortable subtasks
- **Grid view** — card-based layout for tasks
- Toggle between views via a view switcher

### Subscriptions (Stripe)
- Stripe Checkout integration for the **Essential** plan ($9.99/month)
- Subscription status is stored in the `Subscription` model
- Webhook handler at `/api/stripe-webhook` processes Stripe events
- Checkout success/cancel/unverified pages for post-payment flows
- Trial status by default for new users

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI (Dialog, AlertDialog, Avatar, Switch, RadioGroup, Label, Separator) |
| Animations | Framer Motion |
| Drag-and-Drop | @dnd-kit/core, @dnd-kit/sortable |
| Icons | Lucide React, Heroicons, FontAwesome, react-icons |
| Auth | NextAuth v5 (beta) with Google + GitHub + Credentials |
| Database ORM | Prisma 6 |
| Database | MongoDB (Atlas) |
| AI | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| Data Fetching | TanStack Query v5 |
| HTTP | Axios |
| Payments | Stripe |
| Validation | Zod |
| Date Utilities | date-fns |
| Toasts | react-hot-toast |

## Database Schema

All models use MongoDB ObjectIds. The hierarchy is:

```
User
 └── UserOrganization (role: ADMIN | MEMBER)
      └── Organization
           └── Project
                ├── Task
                │    └── Subtask
                │         └── Comment
                ├── AISuggestedTask
                ├── Insight
                └── ProjectSummary

User
 ├── PointsEarned (per subtask completed)
 └── Subscription (Stripe plan)
```

### Key Models

| Model | Purpose |
|-------|---------|
| `User` | Core user; holds auth, guided mode flag |
| `Organization` | Workspace grouping users and projects |
| `UserOrganization` | Many-to-many join with `ADMIN`/`MEMBER` role |
| `Project` | Top-level work item under an org |
| `Task` | Mid-level item under a project |
| `Subtask` | Actionable item; tracks status, assignee, due date, priority, tags, points |
| `Comment` | Discussion thread on a subtask |
| `AISuggestedTask` | AI-generated task candidates pending user review |
| `ProjectSortIndex` | Per-user project sort order |
| `TaskSortIndex` | Per-user task sort order |
| `SubtaskSortIndex` | Per-user subtask sort order |
| `PointsEarned` | Tracks points awarded per completed subtask |
| `Subscription` | Stripe subscription record per user |
| `Insight` | AI-generated project insights and desired outcomes |
| `ProjectSummary` | Cached AI project summary with done/pending lists |

## App Routes

```
/                        Landing page
/login                   Sign in
/register                Sign up (email/password or OAuth)
/dashboard               Project list with drag-drop reordering
/project/[id]            Project detail — tasks, subtasks, AI suggestions
/project/subtask/[id]    Single subtask detail
/points                  Personal points dashboard
/allpoints               Organization-wide points leaderboard
/checkout/success        Post-Stripe payment success
/checkout/cancel         Stripe checkout cancelled
/checkout/unverified     Unverified subscription state
```

## Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>"

# NextAuth
AUTH_SECRET="<random-secret>"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
AUTH_GOOGLE_ID="<google-client-id>"
AUTH_GOOGLE_SECRET="<google-client-secret>"
AUTH_GITHUB_ID="<github-client-id>"
AUTH_GITHUB_SECRET="<github-client-secret>"

# Google Gemini (supports up to 3 keys for rotation)
GEMINI_API_KEY="<your-primary-key>"
GEMINI_API_KEY_1="<optional-secondary-key>"
GEMINI_API_KEY_2="<optional-tertiary-key>"

# Stripe
STRIPE_SECRET_KEY="<stripe-secret>"
STRIPE_WEBHOOK_SECRET="<stripe-webhook-signing-secret>"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="<stripe-publishable-key>"
```

## Running Locally

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- A MongoDB Atlas cluster (free tier works)
- Google and/or GitHub OAuth app credentials

### Install & Run

```bash
cd task-tracker

# Install dependencies
pnpm install

# Push schema to your MongoDB database
pnpm db:update

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
pnpm build
pnpm start
```

> The build step runs `prisma generate` automatically before compiling Next.js.

### Useful Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Generate Prisma client + build Next.js |
| `pnpm start` | Start production server |
| `pnpm db:update` | Push schema changes to DB + regenerate client |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format all files with Prettier |
