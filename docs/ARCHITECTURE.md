# 📘 ChubiPocket Architecture (Next.js 16 Standard)

This document outlines the project structure for Next.js 16 (App Router), emphasizing **Server Components**, **Server Actions**, and **Mobile-First Design**.

## 1. Project Structure

We will add an `actions/` folder and reduce the role of `api/`.

```text
chubi-pocket-web/
├── public/
├── src/
│   ├── actions/                # 🆕 (Server Actions) Functions to call Go Backend
│   │   ├── auth.ts             # login, register, logout
│   │   ├── transaction.ts      # createTransaction, deleteTransaction
│   │   └── ...
│   │
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Group: Login/Register
│   │   ├── (dashboard)/        # Group: Main App
│   │   │   ├── page.tsx        # (Server Component) Fetch data here directly
│   │   │   └── ...
│   │   ├── api/                # ⚠️ For Webhooks or External Access only
│   │   ├── globals.css
│   │   └── layout.tsx
│   │
│   ├── components/             # Shared UI
│   │   ├── ui/                 # Design System (Shadcn/Tailwind)
│   │   ├── layout/             # MobileNav, Sidebar
│   │   └── shared/             # Business Components
│   │
│   ├── features/               # ⚡️ Feature-based Modules
│   │   ├── [feature]/          # e.g., social, accounting
│   │   │   ├── components/     # Feature-specific UI
│   │   │   └── utils.ts        # Helper functions
│   │
│   ├── lib/                    # Core Utilities
│   │   ├── dal.ts              # 🆕 Data Access Layer (Centralized Fetch Wrapper)
│   │   ├── utils.ts            # Formatting helpers
│   │   └── session.ts          # 🆕 Server-side Session/Cookie management
│   │
│   ├── hooks/                  # Client Hooks (useMediaQuery, etc.)
│   ├── store/                  # Client State (Zustand) - UI State only (e.g., Sidebar Open/Close)
│   └── types/                  # TypeScript Definitions
│
├── tailwind.config.ts
├── next.config.ts              # Next.js Config (TypeScript support in v15+)
└── ...
```

## 2. Key Differences in Next.js 16 Standard

### 2.1 Data Fetching (Server Components First)

In Next.js 16, we avoid using `useEffect` for data fetching in Client Components. Instead, we fetch data in the **Page (Server Component)** and pass props down, or fetch directly in `async` components.

**✅ Good (Next.js 16 Standard):**

```tsx
// src/app/(dashboard)/page.tsx
import { getSummary } from '@/actions/accounting'

export default async function DashboardPage() {
  // Fetch data on Server (Go Backend) before rendering HTML
  const summary = await getSummary()

  return (
    <main>
      <SummaryCard data={summary} />
    </main>
  )
}
```

### 2.2 Mutations (Server Actions)

Instead of creating `app/api/login/route.ts`, we declare a function as a Server Action, which can be called like a normal function in a form.

**✅ Good (Server Action):**

```tsx
// src/actions/auth.ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const username = formData
    .get('username')(
      // ... Call Go Backend ...

      // Set Cookie on Next.js Server side (Safer than Client)
      await cookies()
    )
    .set('token', '...', { httpOnly: true })

  redirect('/dashboard')
}
```

### 2.3 Data Access Layer (`src/lib/dal.ts`)

For organization and centralized token management, we should create a Wrapper for `fetch` to communicate with the Go Backend.

```tsx
// src/lib/dal.ts (Data Access Layer)
import { cookies } from 'next/headers'

const GO_API_URL = process.env.NEXT_PUBLIC_API_URL

export async function fetchGoAPI(path: string, options: RequestInit = {}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const res = await fetch(`${GO_API_URL}${path}`, {
    ...options,
    headers,
    // Next.js 15+ caching defaults need careful handling
    cache: options.cache || 'no-store',
  })

  if (!res.ok) {
    throw new Error(`API Error: ${res.statusText}`)
  }

  return res.json()
}
```

## 3. Design System & Layout (Mobile First)

_(Logic remains the same, but Code Style updated for Modern React)_

### `src/app/globals.css` (Updated)

Next.js 16 still uses Tailwind as the primary styling engine.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Financial Colors */
    --income: 142 76% 36%;
    --expense: 0 84% 60%;
    /* ... (other colors) ... */
  }
}
```

## 4. Development Rules (Updated for Next.js 16)

1.  **'use server' by default:** Always assume code runs on the Server. Try to fetch data in Server Components (`page.tsx`) as much as possible.
2.  **'use client' at the leaves:** Add `'use client'` only at the leaf nodes where actual user interaction occurs (buttons, form inputs, charts).
3.  **Server Actions for Form:** Use `<form action={serverAction}>` primarily. Avoid traditional `onSubmit` unless necessary.
4.  **Zustand for UI Only:** Use Global State (Zustand) only for UI state (e.g., Menu Open/Close). For Data, use Next.js Cache or React Query (if complex), but start with Native Fetch.

---

**Summary:**
This structure represents **Modern Next.js 16**, focusing on Server-side operations (Server Actions / Server Components) for better Performance and SEO, leaving the Client to handle only UI Rendering and Interactivity.
