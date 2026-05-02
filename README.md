# Hotel Reservation System

A full-stack hotel reservation system built as a monorepo with Bun, React, Express, and TypeScript.

## Tech Stack

- **Runtime:** Bun
- **Backend:** Node.js + Express + TypeScript
- **Frontend:** React 18 + Vite + TypeScript + TailwindCSS
- **Database:** PostgreSQL (via Docker)
- **Validation:** Zod schemas

## Structure

```
hotel-reservation-system/
├── apps/
│   ├── api/              # Express + TypeScript backend
│   └── web/              # React + Vite + TypeScript frontend
├── packages/
│   └── shared/           # Shared types, enums, and Zod schemas
├── docker-compose.yml    # PostgreSQL service
└── README.md
```

## Prerequisites

- Bun >= 1.0
- Docker & Docker Compose

## Getting Started

1. Install dependencies:
   ```bash
   bun install
   ```

2. Start PostgreSQL:
   ```bash
   docker-compose up -d
   ```

3. Run the API:
   ```bash
   bun run dev:api
   ```

4. Run the Web app:
   ```bash
   bun run dev:web
   ```

## Workspaces

| Package | Description |
|---------|-------------|
| `@hotel/api` | Express backend with admin APIs |
| `@hotel/web` | React frontend with admin dashboard |
| `@hotel/shared` | Shared types and Zod validation schemas |

## Features

- **Admin Dashboard:** System administration for bookings, hotels, reviews, and users
- **Booking Management:** Full booking lifecycle management
- **Hotel Management:** Hotel listings and profile management
- **Review System:** Review moderation and management