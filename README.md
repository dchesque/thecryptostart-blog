# Crypto Academy Blog

A modern educational blog about cryptocurrency, blockchain, and Web3 built with Next.js 16, PostgreSQL/Prisma, and optimized for SEO with Google AdSense integration.

## Features

- 🚀 **Next.js 16** - Latest React framework with App Router
- 📝 **PostgreSQL/Prisma** - Self-hosted Content Management System
- 🔐 **NextAuth.js** - Secure authentication with JWT sessions
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 📱 **Responsive Design** - Mobile-first approach
- 🔍 **SEO Optimized** - Meta tags, Open Graph, Twitter Cards, Schema.org
- 💰 **Google AdSense** - Monetization ready
- 🌙 **Dark Theme** - Crypto-themed dark UI
- ⚡ **Performance** - Image optimization, caching, ISR

## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Typography Plugin
- **Database**: PostgreSQL (Prisma ORM)
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A PostgreSQL database running
- Google AdSense account (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/crypto-academy-blog.git
cd crypto-academy-blog
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/blogdb"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXX (optional)
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxx (optional)
AUTH_SECRET=your_auth_secret_key (run: npx auth secret)
```

## Authentication

The blog includes a built-in authentication system using NextAuth.js v5.

### Admin Dashboard

Access the admin dashboard at `/admin`. Protected routes require authentication.

### Demo Credentials

For development/demo purposes:
- **Email**: `admin@cryptoacademy.com`
- **Password**: `admin123`

### Login Page

Visit `/login` to access the authentication page.

> ⚠️ **Important**: In production, replace the hardcoded demo user with a real database. The current setup is for demonstration purposes only.

### Database Setup

1. Push your Prisma Schema to the database:
```bash
npx prisma db push
```

2. Seed your database with a default Admin and initial Categories:
```bash
npx prisma db seed
```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🐳 Docker Deployment

### Build & Run

```bash
# Build image
docker build -t crypto-academy-blog .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:passwd@db:5432/blogdb \
  -e NEXT_PUBLIC_SITE_URL=https://seu-dominio.com \
  crypto-academy-blog
```

### Docker Compose

```bash
# Create .env file
cp .env.example .env

# Start
docker-compose up -d

# View logs
docker-compose logs -f
```

### EasyPanel

1. Build image: `docker build -t crypto-academy-blog .`
2. Push to registry ou upload to EasyPanel
3. Configure environment variables
4. Deploy!

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## Project Structure

```
crypto-academy-blog/
├── app/                  # Next.js app directory
│   ├── admin/           # Admin dashboard (protected)
│   ├── api/auth/        # NextAuth.js API routes
│   ├── blog/            # Blog pages
│   ├── login/           # Login page
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Homepage
├── auth.ts              # NextAuth.js configuration
├── middleware.ts        # Route protection middleware
├── components/          # React components
│   ├── AuthProvider.tsx # Session provider
│   └── SignOutButton.tsx# Logout component
├── lib/                # Utility functions
├── public/             # Static assets
├── styles/             # Global styles
└── types/              # TypeScript types
```

## Contributing

Contributions, issues, and feature requests are welcome!

## License

This project is open source and available under the MIT License.
