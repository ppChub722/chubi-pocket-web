# 🧩 ChubiPocket Global UI Systems

This document establishes the standards for Global Overlay Components, using **Zustand** for State management and rendering at `RootLayout` to reduce redundancy.

## 1. Unified Modal System (One Modal to Rule Them All)

We use a single Modal that can adapt its content (Confirm, Info, Custom) to easily control the Design System.

### 1.1 Architecture

1.  **Store (`src/store/useModalStore.ts`):** Stores state `isOpen`, `type`, `content`, `onConfirm`
2.  **Hook (`src/hooks/useModal.ts`):** Facade for easy calling (`confirm()`, `alert()`)
3.  **Component (`src/components/shared/GlobalModal.tsx`):** The actual UI component floating above.

### 1.2 Usage Pattern

Do NOT import the Modal Component and place it yourself. Always call it via the Hook.

```tsx
const { confirm } = useModal()

const handleDelete = () => {
  confirm({
    title: 'Confirm Deletion',
    description: 'Data will be permanently lost',
    danger: true, // Red button
    confirmText: 'Delete Item',
    onConfirm: async () => {
      await deleteItem()
    },
  })
}
```

### 1.3 Modal Types

- `info`: Has only an "Acknowledge" button (Used instead of Alert)
- `confirm`: Has "Confirm" and "Cancel" buttons (Supports Async loading on the confirm button)
- `custom`: Accepts any React Node (e.g., Quick Edit Form)

## 2. Global Loader

Using **Reference Counting** (counting requests) to prevent the Loader from disappearing before all data is loaded.

- **Store:** `useLoadingStore.ts` (Count: +1 when starting, -1 when finished)
- **Component:** `<GlobalLoader />` (Shows Fullscreen Overlay when count > 0)

```tsx
// src/lib/api-client.ts (Example Integration)
const { startLoading, stopLoading } = useLoadingStore.getState();

try {
  startLoading();
  await fetch(...);
} finally {
  stopLoading();
}
```

## 3. Toast Notifications

Using the **`sonner`** library due to its good performance and support for Stacked Toasts.

- **Config:** `src/components/ui/sonner.tsx` (Adjust colors to match Tailwind Theme)
- **Usage:**
  ```tsx
  import { toast } from 'sonner'
  toast.success('Saved successfully')
  toast.error('An error occurred', { description: 'Please try again' })
  ```

## 4. Integration Guide

All components must be installed in `src/app/layout.tsx` only once.

```tsx
import { GlobalModal } from '@/components/shared/GlobalModal'
import { GlobalLoader } from '@/components/shared/GlobalLoader'
import { Toaster } from '@/components/ui/sonner'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        {/* Overlay Layers (Z-Index ordered) */}
        <Toaster /> {/* z-50 */}
        <GlobalModal /> {/* z-100 */}
        <GlobalLoader /> {/* z-200 (Overlays everything) */}
      </body>
    </html>
  )
}
```
