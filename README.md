# Crypto Academy Blog

A modern educational blog about cryptocurrency, blockchain, and Web3 built with Next.js 16, Contentful CMS, and optimized for SEO with Google AdSense integration.

## Features

- 🚀 **Next.js 16** - Latest React framework with App Router
- 📝 **Contentful CMS** - Headless CMS for content management
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
- **CMS**: Contentful
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Contentful account with a space set up
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
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_delivery_token
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

### Contentful Setup

1. Create a Content Model called `blogPost` with the following fields:
   - `title` (Text, Short text)
   - `slug` (Text, Short text, Unique)
   - `description` (Text, Long text)
   - `content` (Rich text)
   - `featuredImage` (Media, One asset)
   - `author` (Text, Short text)
   - `category` (Text, Short text, Select: blockchain, bitcoin, defi, security, trading, nft, web3)
   - `tags` (List, Short text)
   - `readingTime` (Number, Integer)

2. Add API keys to your `.env.local`

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
  -e CONTENTFUL_SPACE_ID=seu_space_id \
  -e CONTENTFUL_ACCESS_TOKEN=seu_token \
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
