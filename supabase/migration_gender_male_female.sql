-- =====================================================================
-- ASIAN OUD: SQL MIGRASI CONSTRAINT GENDER (MALE & FEMALE)
-- JALANKAN INI DI SUPABASE SQL EDITOR (OPSIONAL TAPI DISARANKAN)
-- =====================================================================

alter table orders drop constraint if exists orders_valid;
alter table orders add constraint orders_valid check (
  char_length(nama) between 2 and 100 and char_length(email) <= 150
  and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  and phone ~ '^[0-9]{8,15}$' and gender in ('Laki-laki','Perempuan','Male','Female')
  and (alamat is null or char_length(alamat) <= 1000)
  and oud_country in ('Thailand','Cambodia','Vietnam','Malaysia','Indonesia','Laos')
  and oud_id between 1 and 8 and char_length(oud_name) <= 150
  and status in ('Baru','Diproses','Dikirim','Selesai')) not valid;

