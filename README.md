# 🍰 CrumbleCakes

Welcome to **CrumbleCakes** — a beautifully engineered, premium modern web application for a boutique bakery. Built with React and Vite, this platform features a cutting-edge "glassmorphic" UI, providing customers with an immersive and elegant experience while interacting with our custom cake builder and rich product catalog.

![CrumbleCakes Aesthetic](https://img.shields.io/badge/UI-Glassmorphism-FF6B9D?style=for-the-badge&logo=css3) ![Built With React](https://img.shields.io/badge/Built_With-React_&_Vite-61DAFB?style=for-the-badge&logo=react) ![Database Structure](https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=for-the-badge&logo=supabase)

## ✨ Premium Features
*   **Modern Glassmorphic UI**: Ultra-smooth gradients, translucent backgrounds, and stunning tactile hover micro-animations provide a VIP user experience.
*   **Custom Cake Builder**: A fully interactive "Build Your Own" module allowing users to upload photo inspirations, select sizes, and submit personalized baking instructions.
*   **Full Authentication System**: End-to-end user authentication supported by Supabase, featuring magic links, gorgeous modal layouts, secure sessions, and profile tracking.
*   **Dynamic Admin Dashboard**: A specialized `/admin` routing interface protecting real-time analytics. Features interactive sales trends with auto-scaling minimum heights, glass status pills, and integrated secure inventory management tools.
*   **Global State Flow**: Clean React Context implementation (`OrderContext`, `ProductContext`, `AuthContext`) for real-time cart drawer updates across the entire application.

## 🛠️ Technology Stack
*   **Frontend**: React.js, Vite, Vanilla CSS3 (Custom Glass UI Architecture)
*   **Backend & DB**: Supabase (PostgreSQL, Real-time Auth, Storage Integration)
*   **Deployment & Ops**: GitHub Actions (Automated background cron jobs injected securely to prevent backend pausing).
*   **Iconography**: Lucide React

## 🚀 Local Development Setup

To run this beautifully crafted bakery platform on your local machine:

**1. Clone the repository**
```bash
git clone git@github.com:anrix05/Crumblecake.git
cd Crumblecake
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure Environment Variables**
Create a `.env.local` file in the root formatting your active Supabase secure connection strings:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_public_anon_key
```

**4. Start the Application**
```bash
npm run dev
```

---

*Designed and engineered with passion for premium digital experiences. No more boring dashboards.*
