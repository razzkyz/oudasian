# Oud ASEAN

Vite (vanilla JS) + Supabase. Notifikasi pesanan lewat Telegram bot.

## Jalankan
1. `npm install`
2. Salin `.env.example` → `.env`, isi URL & anon key Supabase
3. Buka `supabase/setup.sql`, edit 3 nilai di bagian KONFIGURASI (token bot, chat id, PIN), lalu jalankan seluruhnya di Supabase SQL Editor (aman dijalankan ulang)
4. `npm run dev` → http://localhost:5173

## Halaman
| Route | Fungsi |
|---|---|
| `#/` | Pilih negara + 8 kartu oud |
| `#/oud/<negara>/<1-8>` | Detail + form pemesanan |
| `#/cek` | Cek pesanan pakai no. telepon |
| `#/admin` | CMS (PIN diatur di setup.sql, bisa diganti dari tab Halaman) |

## Struktur
```
public/            favicon, robots.txt, images/ (aset statis)
src/
  main.js          router
  data/oud.js      daftar negara & oud default
  lib/             supabase client, store (data CMS), utils
  pages/           home, detail, cek, admin
  styles/main.css
supabase/setup.sql SQL lengkap (tabel, RLS, cek pesanan, CMS, Telegram)
```
