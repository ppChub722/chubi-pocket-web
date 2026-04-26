# 📘 ChubiPocket State Management Guidelines

This document establishes the **Client-Side State** management standards for the ChubiPocket project (Next.js 16), using **Zustand** as the core and the **Facade Pattern** to control data access.

## 1. Philosophy

1.  **Internal vs Public:** Separate the "Store" (Storage) from the "Hook" (Access Method).
    - ❌ **Don't:** Call `useStore` directly in UI Components.
    - ✅ **Do:** Always call via a Custom Hook (Facade).
2.  **Server First:** Main data (Business Data) should be fetched via Server Components. Zustand data is used for **UI State** (e.g., Menu Open/Close, Modal) or **Global Client Session** only.
3.  **Modular:** Separate Stores by Feature (e.g., `useUIStore`, `useSocialStore`), do not combine everything in one place.

## 2. Directory Structure

```text
src/
├── store/                  # 🔒 Internal Stores (Zustand Definitions)
│   ├── useUIStore.ts         # Example: Sidebar state, Global Loading
│   └── use[Feature]Store.ts  # Example: useSocialStore.ts
│
├── hooks/                  # 🚀 Public Hooks (Facades)
│   ├── useUI.ts              # Central Hook for calling UI Actions
│   └── use[Feature].ts       # Example: useSocial.ts
│
└── components/             # 🎨 UI Components
    └── ... (Call hooks/use...ts here)
```

## 3. The Pattern

When adding a new State, follow these 3 steps:

### Step 1: Create the Store (Internal)

Create a file in `src/store/` starting with `use...Store.ts`.
_Clearly define the Type of State and Actions._

```typescript
// src/store/useUIStore.ts
import { create } from 'zustand'

interface UIState {
  isSidebarOpen: boolean
  isLoading: boolean

  // Actions
  toggleSidebar: () => void
  setLoading: (status: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  isLoading: false,

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setLoading: (status) => set({ isLoading: status }),
}))
```

### Step 2: Create the Facade Hook (Public)

Create a file in `src/hooks/` starting with `use...ts`.
_This Hook collects State and Logic before sending it to the Component._

```typescript
// src/hooks/useUI.ts
import { useUIStore } from '@/store/useUIStore'

export function useUI() {
  // Select state (For better performance than fetching the whole object)
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const isLoading = useUIStore((state) => state.isLoading)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const setLoading = useUIStore((state) => state.setLoading)

  // Custom Logic can be added here (e.g., Logging button clicks)
  const closeSidebar = () => {
    if (isSidebarOpen) toggleSidebar()
  }

  return {
    isSidebarOpen,
    isLoading,
    toggleSidebar,
    closeSidebar, // Export the processed function
    setLoading,
  }
}
```

### Step 3: Use in Components

Call only via Custom Hook, making the Code clean and readable.

```tsx
// src/components/layout/Header.tsx
'use client'

import { useUI } from '@/hooks/useUI' // Import from hooks, NOT store

export default function Header() {
  const { toggleSidebar, isLoading } = useUI()

  return (
    <header>
      <button onClick={toggleSidebar}>
        {isLoading ? 'Loading...' : 'Menu'}
      </button>
    </header>
  )
}
```

## 4. Accessing State Outside Components

In some cases (e.g., API Utilities, Event Listeners), we need to access State without being in a React Component. Use `getState()`.

```typescript
// src/lib/api-client.ts (Example)
import { useUIStore } from '@/store/useUIStore'

async function fetchData() {
  // 1. Start Loading (Call Action directly)
  useUIStore.getState().setLoading(true)

  try {
    await fetch('...')
  } finally {
    // 2. Stop Loading
    useUIStore.getState().setLoading(false)
  }
}
```

## 5. Applying to Future Modules

When starting to develop a new Module (e.g., Social Splitting), use the same Pattern:

1.  **Define Interface:** Determine what data this Module needs to store (e.g., `friendList`, `currentBill`).
2.  **Create Store:** `src/store/useSocialStore.ts`
3.  **Create Hook:** `src/hooks/useSocial.ts`
4.  **Connect UI:** Have Components in `features/social/components` call `useSocial()`.

## 6. Rules for AI Agent 🤖

1.  **Naming Convention:**
    - Store files MUST end with `Store.ts` (e.g., `useCartStore.ts`).
    - Hook files MUST NOT have `Store` in the name (e.g., `useCart.ts`).
2.  **No Direct Import:** Never import generic stores directly into UI components. Always create a facade hook first.
3.  **Type Safety:** Always define TypeScript interfaces for State and Actions.
4.  **Keep it Light:** Do not store large datasets (like 1,000 transactions) in Zustand if not necessary. Use Server State (React Query / Server Components) for data fetching. Use Zustand for _client-side interactivity_.
