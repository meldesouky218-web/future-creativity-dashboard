# Future Creativity Dashboard (Next.js)

Admin dashboard for the Future Creativity Platform: projects, staff, attendance, payroll, logs and documents. Includes i18n (EN/AR) and a minimal home/login flow ready for production.

## Requirements

- Node.js 18+ (or 20+ recommended)

## Quick start

```
cd future-creativity-dashboard
npm ci
cp .env.local.example .env.local   # Set API base URL
npm run dev
```

Open http://localhost:3000

## Environment variables

- `NEXT_PUBLIC_API_BASE` – Base URL of the API (e.g., `https://api.example.com/api`).

## Scripts

- `npm run dev` – Next dev server
- `npm run build` – Build for production
- `npm start` – Start production server

## Notes

- API client reads `NEXT_PUBLIC_API_BASE`. If not provided, it falls back to `http://localhost:5000/api`.
- Language toggle is available in the navbar/home. The setting persists in `localStorage`.

