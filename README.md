# Binary Elite Web Application

A sophisticated, dark-mode web platform for the Binary Elite tech and edtech collective, featuring a dynamic landing page and admin dashboard powered by Supabase.

## ✨ Features

- 🌟 **Premium Dark Theme** with electric blue accents
- 🎭 **Sophisticated Animations** - floating logo, pulsing glows, starfield background
- 📱 **Fully Responsive** - desktop to mobile
- 🚀 **Next.js 14+** with App Router and SSR
- 💾 **Supabase Backend** - PostgreSQL database with Row Level Security
- 🎨 **Framer Motion** - smooth, professional animations
- ⚡ **Fast Performance** - optimized for 60fps animations

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase** (see [SETUP_GUIDE.md](./SETUP_GUIDE.md))

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Complete setup instructions
- [Implementation Plan](./implementation_plan.md) - Architecture and features

## 🗂️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   └── landing/           # Landing page components
└── lib/
    └── supabase/          # Supabase configuration
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Animations**: Framer Motion
- **Deployment**: Vercel (recommended)

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

## 🔐 Environment Variables

See `.env.local.example` for required variables.

## 🌐 Deployment

Ready to deploy to Vercel, Netlify, or any Node.js hosting platform.

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for deployment instructions.

---

**Built with ❤️ by Binary Elite**
