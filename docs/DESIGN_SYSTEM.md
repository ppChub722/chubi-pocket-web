# 🎨 ChubiPocket Design System

This document establishes the Design System standards for ChubiPocket, emphasizing Mobile-First, Thai language support, and Dynamic Theming.

## 1. Color System (Dynamic Theming)

We use **Tailwind CSS** combined with **CSS Variables** to support Multi-Theme (Dark/Light + Custom Themes like Kirby).

### 1.1 Variable Definitions (`src/app/globals.css`)

Using the **HSL** (Hue Saturation Lightness) system for easy intensity adjustments.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* --- Base System Colors (Default Blue Theme) --- */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --border: 214.3 31.8% 91.4%;
    --radius: 0.5rem;

    /* --- Financial Semantic Colors (Fixed, does not change with Theme) --- */
    --income: 142 76% 36%; /* Green */
    --expense: 0 84% 60%; /* Red */
    --warning: 38 92% 50%; /* Amber */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --border: 217.2 32.6% 17.5%;

    /* Financial Colors (Dark Mode Adjustments) */
    --income: 142 70% 50%;
  }
}
```

### 1.2 Dynamic Theme Engine (Architecture)

In the future, we will load Theme Config from the Database (`themes` table) and inject it into the page.

- **Store:** `useThemeStore.ts` (Stores current color values)
- **Component:** `<ThemeInjector />` (Placed in `layout.tsx` to overwrite `:root` styles)

## 2. Typography (Fonts)

Using `next/font` for maximum performance.

- **Primary Font:** `Inter` (For numbers and English)
- **Secondary Font (Thai):** `Noto Sans Thai` or `Sarabun` (Loopless or Looped depending on Theme suitability)

```tsx
// src/app/layout.tsx
import { Inter, Noto_Sans_Thai } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai'],
  variable: '--font-thai',
  weight: ['300', '400', '500', '600'],
})

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={`${inter.variable} ${notoSansThai.variable}`}>
      {/* ... */}
    </html>
  )
}
```

## 3. Responsive Strategy (Mobile First)

Adhering to the **"Thumb Zone"** and **"Single Breakpoint"** principles.

### 3.1 Breakpoints

- **Default (< 768px):** Mobile View
  - Use **Bottom Tab Bar** (Height 64px)
  - Do NOT use Tables, use **Card Layout**
  - Use **Bottom Sheet** instead of large Modals
- **MD/LG (>= 768px):** Desktop/Tablet View
  - Switch to **Sidebar** on the left
  - Expand Cards to Grid (2-3 columns)
  - Use **Dialog (Modal)** in the center of the screen

### 3.2 Utility Classes Guide

- `hidden md:block`: Hide on mobile, show on large screens
- `flex-col md:flex-row`: Stack vertically on mobile, horizontally on large screens
- `w-full md:w-[300px]`: Full width on mobile, fixed width on large screens
