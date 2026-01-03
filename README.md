# MegaBuy Frontend

Modern Next.js frontend for MegaBuy price comparison platform.

## Tech Stack
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Radix UI
- Lucide Icons

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Production Build

```bash
npm run build
npm start
```

## Docker

```bash
docker build -t megabuy-frontend .
docker run -p 3001:3001 megabuy-frontend
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Go backend API URL (default: http://localhost:3000)
