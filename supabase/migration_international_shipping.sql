-- =====================================================================
-- ASIAN OUD: SQL MIGRASI PENGIRIMAN INTERNASIONAL (NEGARA & KODE POS)
-- JALANKAN INI DI SUPABASE SQL EDITOR
-- Aman dijalankan, tidak akan menabrak / menghapus data yang sudah ada
-- =====================================================================

-- 1. Tambahkan kolom baru untuk pengiriman internasional
alter table orders add column if not exists negara text;
alter table orders add column if not exists kode_pos text;
alter table orders add column if not exists kota text;
alter table orders add column if not exists provinsi text;

-- 2. Berikan izin insert kolom baru untuk pengunjung (anon & authenticated)
grant insert (oud_country, oud_id, oud_name, nama, email, phone, gender, alamat, negara, kode_pos, kota, provinsi) on orders to anon, authenticated;

