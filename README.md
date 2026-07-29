# Derma Nusantara

Landing page Derma Nusantara hasil migrasi dari HTML statis Tailwind CDN ke Next.js App Router.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Lucide React icons

## Struktur

- `app/` berisi layout, metadata, global CSS, dan halaman utama.
- `components/` berisi section landing page yang sudah modular.
- `data/landing-page.ts` berisi konten berulang seperti navigasi, program donasi, artikel, dan footer.
- `tailwind.config.ts` memindahkan token warna, spacing, font, dan type scale dari konfigurasi CDN HTML asal.

## Menjalankan Lokal

```bash
corepack enable
pnpm install
pnpm dev
```

Lalu buka `http://localhost:3000`.

## Validasi

```bash
pnpm lint
pnpm build
```
