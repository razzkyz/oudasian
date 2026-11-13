-- =====================================================================
-- OUD ASEAN: SETUP LENGKAP & AMAN  (aman dijalankan berulang / migrasi)
-- Isi: tabel, validasi, RLS, pesan, cek pemesanan, CMS admin, notif Telegram
-- =====================================================================
create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_net with schema extensions;

-- 1. TABEL ------------------------------------------------------------
create table if not exists orders(
  id bigint generated always as identity primary key,
  oud_country text, oud_id int, oud_name text,
  nama text not null, email text not null, phone text not null, gender text,
  alamat text,
  status text default 'Baru', created_at timestamptz default now());
alter table orders add column if not exists ip text;
alter table orders add column if not exists alamat text;
create table if not exists ouds(country text, slot int, name text, sub text, descr text, img text, img2 text, img3 text, img4 text, video1 text, video2 text, primary key(country,slot));
create table if not exists site(key text primary key, value text);
create table if not exists settings(key text primary key, value text);
create table if not exists admin_sessions(token_hash text primary key, expires_at timestamptz not null);
create table if not exists rate_log(id bigint generated always as identity primary key, kind text, ip text, ok boolean default true, ts timestamptz default now());
create index if not exists rate_log_idx on rate_log(kind, ip, ts);
create index if not exists orders_phone_idx on orders(phone);
create index if not exists orders_ip_idx on orders(ip, created_at);

-- 2. KONFIGURASI: EDIT 3 NILAI INI SEBELUM RUN ---------------------------
do $$
declare v_token text := 'ISI_TOKEN_BOT';   -- token dari @BotFather
        v_chat  text := 'ISI_CHAT_ID';     -- chat id kamu / grup
        v_pin   text := '2245';            -- PIN admin awal (disarankan 8+ karakter)
begin
  if v_token not like 'ISI_%' then insert into settings values('tg_token',v_token) on conflict(key) do update set value=excluded.value; end if;
  if v_chat  not like 'ISI_%' then insert into settings values('tg_chat',v_chat)  on conflict(key) do update set value=excluded.value; end if;
  -- PIN disimpan sebagai hash (bukan teks biasa); PIN lama otomatis dimigrasi
  insert into settings values('admin_pin_hash',
    extensions.crypt(coalesce((select value from settings where key='admin_pin'), v_pin), extensions.gen_salt('bf')))
  on conflict(key) do update set value = excluded.value;
  delete from settings where key='admin_pin';
  delete from rate_log where kind = 'login';
end $$;

-- 3. VALIDASI DATA (tolak data sampah) -----------------------------------
alter table orders drop constraint if exists orders_valid;
alter table orders add constraint orders_valid check (
  char_length(nama) between 2 and 100 and char_length(email) <= 150
  and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  and phone ~ '^[0-9]{8,15}$' and gender in ('Laki-laki','Perempuan')
  and (alamat is null or char_length(alamat) <= 1000)
  and oud_country in ('Thailand','Cambodia','Vietnam','Malaysia','Indonesia','Laos')
  and oud_id between 1 and 8 and char_length(oud_name) <= 150
  and status in ('Baru','Diproses','Dikirim','Selesai')) not valid;
alter table ouds drop constraint if exists ouds_valid;
alter table ouds add constraint ouds_valid check (
  slot between 1 and 8 and country in ('Thailand','Cambodia','Vietnam','Malaysia','Indonesia','Laos')
  and char_length(name) <= 150 and char_length(sub) <= 150 and char_length(descr) <= 3000
  and (img is null or char_length(img) <= 900000)) not valid;
alter table site drop constraint if exists site_valid;
alter table site add constraint site_valid check (
  char_length(key) <= 80 and char_length(value) <= 10000) not valid;

-- 4. RLS + HAK AKSES (anon hanya boleh yang perlu) -----------------------
alter table orders enable row level security;
alter table ouds enable row level security;
alter table site enable row level security;
alter table settings enable row level security;
alter table admin_sessions enable row level security;
alter table rate_log enable row level security;
revoke all on orders, ouds, site, settings, admin_sessions, rate_log from anon, authenticated;
grant select on ouds, site to anon, authenticated;
grant insert (oud_country,oud_id,oud_name,nama,email,phone,gender,alamat) on orders to anon, authenticated;
drop policy if exists "anon insert" on orders;
drop policy if exists "order insert" on orders;
create policy "order insert" on orders for insert to anon, authenticated with check (true);
drop policy if exists "read ouds" on ouds;  create policy "read ouds" on ouds for select to anon, authenticated using (true);
drop policy if exists "read site" on site;  create policy "read site" on site for select to anon, authenticated using (true);

-- 5. FUNGSI INTERNAL ------------------------------------------------------
drop function if exists _pin_ok(text);
create or replace function _ip() returns text language sql stable as $$
  select coalesce(nullif(split_part(coalesce((nullif(current_setting('request.headers', true), '')::json)->>'x-forwarded-for', ''), ',', 1), ''), 'unknown') $$;

create or replace function _admin_ok(p_token text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if p_token is null or not exists(select 1 from admin_sessions
     where token_hash = encode(digest(p_token,'sha256'),'hex') and expires_at > now())
  then raise exception 'Sesi habis, silakan login ulang'; end if;
end $$;

-- anti-spam pesanan: maks 5 / 10 menit per IP, 5 / jam per nomor telepon
create or replace function orders_guard() returns trigger
language plpgsql security definer set search_path = public, extensions as $$
begin
  new.ip := _ip(); new.status := 'Baru'; new.created_at := now();
  if new.ip <> 'unknown' and (select count(*) from orders where ip = new.ip and created_at > now() - interval '10 minutes') >= 5
    then raise exception 'Terlalu banyak pesanan, coba lagi beberapa menit lagi.'; end if;
  if (select count(*) from orders where phone = new.phone and created_at > now() - interval '1 hour') >= 5
    then raise exception 'Nomor ini sudah terlalu banyak memesan, coba lagi nanti.'; end if;
  return new;
end $$;
drop trigger if exists on_order_guard on orders;
create trigger on_order_guard before insert on orders for each row execute function orders_guard();

-- notif Telegram (gagal kirim TIDAK membatalkan pesanan)
create or replace function notify_tg() returns trigger
language plpgsql security definer set search_path = public, extensions as $$
declare t text; c text;
begin
  select value into t from settings where key='tg_token';
  select value into c from settings where key='tg_chat';
  if coalesce(t,'') = '' or t like 'ISI_%' then return new; end if;
  begin
    perform net.http_post(url := 'https://api.telegram.org/bot'||t||'/sendMessage',
      headers := '{"Content-Type":"application/json"}'::jsonb,
      body := jsonb_build_object('chat_id', c, 'text',
        E'🛎 PESANAN BARU #'||new.id||E'\n\n🪵 '||new.oud_name||E'\n👤 '||new.nama||E'\n📧 '||new.email||E'\n📞 '||new.phone||E'\n⚧ '||coalesce(new.gender,'-')||E'\n📍 '||coalesce(new.alamat,'-')));
  exception when others then null;
  end;
  return new;
end $$;
drop trigger if exists on_order_tg on orders;
create trigger on_order_tg after insert on orders for each row execute function notify_tg();

-- 6. CEK PEMESANAN (publik, cukup nomor telepon) --------------------------
-- dibatasi 15 cek / 10 menit per IP, email disamarkan, IP tidak dibocorkan
drop function if exists cek_pesanan(text);
create function cek_pesanan(p_phone text)
returns table(id bigint, oud_name text, nama text, email text, phone text, gender text, status text, created_at timestamptz, alamat text)
language plpgsql security definer set search_path = public, extensions as $$
declare v_ip text := _ip();
begin
  if p_phone is null or p_phone !~ '^[0-9]{8,15}$' then raise exception 'Nomor telepon tidak valid'; end if;
  if v_ip <> 'unknown' and (select count(*) from rate_log r where r.kind='cek' and r.ip=v_ip and r.ts > now() - interval '10 minutes') >= 15
    then raise exception 'Terlalu banyak pengecekan, coba lagi beberapa menit lagi.'; end if;
  if random() < 0.05 then delete from rate_log r where r.ts < now() - interval '1 day'; end if;
  insert into rate_log(kind, ip) values('cek', v_ip);
  return query select o.id, o.oud_name, o.nama, regexp_replace(o.email,'^(.).*(@.*)$','\1***\2'),
                      o.phone, o.gender, o.status, o.created_at, o.alamat
               from orders o where o.phone = p_phone order by o.created_at desc;
end $$;

-- 7. ADMIN / CMS (login PIN -> token sesi 8 jam; salah 5x = kunci 15 menit)
create or replace function admin_login(p_pin text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare v_ip text := _ip(); v_hash text; tok text; v_max int;
begin
  delete from rate_log r where r.ts < now() - interval '1 day';
  delete from admin_sessions where expires_at < now();
  v_max := case when v_ip = 'unknown' then 30 else 5 end;
  if (select count(*) from rate_log r where r.kind='login' and r.ok=false and r.ip=v_ip and r.ts > now() - interval '15 minutes') >= v_max
    then return jsonb_build_object('ok', false, 'msg', 'Terlalu banyak percobaan salah. Coba lagi 15 menit lagi.'); end if;
  select value into v_hash from settings where key='admin_pin_hash';
  if p_pin is null or v_hash is null or crypt(p_pin, v_hash) <> v_hash then
    insert into rate_log(kind, ip, ok) values('login', v_ip, false);
    return jsonb_build_object('ok', false, 'msg', 'PIN salah');
  end if;
  tok := encode(gen_random_bytes(24), 'hex');
  insert into admin_sessions values(encode(digest(tok,'sha256'),'hex'), now() + interval '8 hours');
  return jsonb_build_object('ok', true, 'token', tok);
end $$;

create or replace function admin_list(p_pin text) returns setof orders
language plpgsql security definer set search_path = public, extensions as $$
begin perform _admin_ok(p_pin); return query select * from orders order by created_at desc; end $$;

create or replace function admin_status(p_pin text, p_id bigint, p_status text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform _admin_ok(p_pin);
  if p_status not in ('Baru','Diproses','Dikirim','Selesai') then raise exception 'Status tidak valid'; end if;
  update orders set status = p_status where id = p_id;
end $$;

create or replace function admin_update_order(
  p_pin text,
  p_id bigint,
  p_nama text,
  p_phone text,
  p_email text,
  p_gender text default null,
  p_alamat text default null,
  p_status text default 'Baru'
) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform _admin_ok(p_pin);
  if p_status not in ('Baru','Diproses','Dikirim','Selesai') then raise exception 'Status tidak valid'; end if;
  update orders
  set nama = coalesce(nullif(trim(p_nama),''), nama),
      phone = coalesce(nullif(trim(p_phone),''), phone),
      email = coalesce(nullif(trim(p_email),''), email),
      gender = p_gender,
      alamat = p_alamat,
      status = p_status
  where id = p_id;
end $$;

create or replace function admin_save_oud(
  p_pin text, p_country text, p_slot int,
  p_name text, p_sub text, p_descr text,
  p_img text,
  p_img2 text default null,
  p_img3 text default null,
  p_img4 text default null,
  p_video1 text default null,
  p_video2 text default null
)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  perform _admin_ok(p_pin);
  insert into ouds(country,slot,name,sub,descr,img,img2,img3,img4,video1,video2)
    values(p_country,p_slot,p_name,p_sub,p_descr,
           nullif(p_img,''), nullif(p_img2,''), nullif(p_img3,''), nullif(p_img4,''),
           nullif(p_video1,''), nullif(p_video2,''))
  on conflict(country,slot) do update set
    name=excluded.name, sub=excluded.sub, descr=excluded.descr,
    img    = case when p_img    is null then ouds.img    when p_img    ='' then null else p_img    end,
    img2   = case when p_img2   is null then ouds.img2   when p_img2   ='' then null else p_img2   end,
    img3   = case when p_img3   is null then ouds.img3   when p_img3   ='' then null else p_img3   end,
    img4   = case when p_img4   is null then ouds.img4   when p_img4   ='' then null else p_img4   end,
    video1 = case when p_video1 is null then ouds.video1 when p_video1 ='' then null else p_video1 end,
    video2 = case when p_video2 is null then ouds.video2 when p_video2 ='' then null else p_video2 end;
end $$;

create or replace function admin_save_site(p_pin text, p_key text, p_value text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform _admin_ok(p_pin);
  if p_key is null or char_length(trim(p_key)) < 1 or char_length(p_key) > 80 then raise exception 'Kunci tidak valid'; end if;
  if char_length(coalesce(p_value,'')) > 10000 then raise exception 'Nilai terlalu panjang (maks 10000 karakter)'; end if;
  insert into site values(p_key, p_value) on conflict(key) do update set value = excluded.value;
end $$;

create or replace function admin_set_pin(p_pin text, p_new text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform _admin_ok(p_pin);
  if p_new is null or char_length(p_new) < 4 or char_length(p_new) > 64 then raise exception 'PIN minimal 4 karakter'; end if;
  update settings set value = crypt(p_new, gen_salt('bf')) where key='admin_pin_hash';
  delete from admin_sessions where token_hash <> encode(digest(p_pin,'sha256'),'hex');
end $$;

-- 8. HAK EKSEKUSI FUNGSI --------------------------------------------------
revoke all on function _ip(), _admin_ok(text), orders_guard(), notify_tg() from public, anon, authenticated;
revoke all on function cek_pesanan(text), admin_login(text), admin_list(text), admin_status(text,bigint,text),
  admin_update_order(text,bigint,text,text,text,text,text,text),
  admin_save_oud(text,text,int,text,text,text,text,text,text,text,text,text), admin_save_site(text,text,text), admin_set_pin(text,text) from public;
grant execute on function cek_pesanan(text), admin_login(text), admin_list(text), admin_status(text,bigint,text),
  admin_update_order(text,bigint,text,text,text,text,text,text),
  admin_save_oud(text,text,int,text,text,text,text,text,text,text,text,text), admin_save_site(text,text,text), admin_set_pin(text,text) to anon, authenticated;
