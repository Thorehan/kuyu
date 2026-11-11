-- Kuyu · skor tablosu (Supabase / Postgres). Kurulum adımları: docs/online-kurulum.md
-- Supabase panelinde SQL Editor'a yapıştırıp bir kez çalıştırılır.
-- NOT: Bu dosya gerçek bir Supabase projesinde henüz çalıştırılmadı (hesap açılmadı). Oyunun istemcisi aynı
-- kuralları uygulayan yerel sahte sunucuyla (tools/sahte-sunucu.js) uçtan uca denendi.

create table if not exists public.skorlar (
  tahta  text        not null check (tahta ~ '^[hg]-\d{4}-\d{2}-\d{2}$'),  -- h-2026-11-09 haftalık, g-2026-11-11 günlük
  oyuncu uuid        not null,                                             -- cihazda üretilen rastgele kimlik (hesap değil)
  ad     text        not null check (char_length(ad) between 1 and 16),
  puan   integer     not null check (puan between 0 and 5000000),
  metre  integer     not null default 0 check (metre between 0 and 200000),
  zaman  timestamptz not null default now(),
  primary key (tahta, oyuncu)
);
create index if not exists skorlar_sira on public.skorlar (tahta, puan desc);

-- Satır düzeyi güvenlik: herkes okur, kimse doğrudan yazamaz. Yazma yalnız aşağıdaki işlevle.
alter table public.skorlar enable row level security;
drop policy if exists "herkes okur" on public.skorlar;
create policy "herkes okur" on public.skorlar for select using (true);
grant select on public.skorlar to anon;

-- Oyuncu başına tahtada tek satır; yalnız daha iyi puan yazılır.
create or replace function public.skor_gonder(p_tahta text, p_oyuncu uuid, p_ad text, p_puan integer, p_metre integer)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if p_tahta !~ '^[hg]-\d{4}-\d{2}-\d{2}$' or p_puan is null or p_puan < 0 or p_puan > 5000000
     or p_metre is null or p_metre < 0 or p_metre > 200000 or char_length(trim(coalesce(p_ad, ''))) < 1 then
    return false;
  end if;
  insert into skorlar (tahta, oyuncu, ad, puan, metre)
  values (p_tahta, p_oyuncu, left(trim(p_ad), 16), p_puan, p_metre)
  on conflict (tahta, oyuncu) do update
    set ad = excluded.ad,
        puan = greatest(skorlar.puan, excluded.puan),
        metre = greatest(skorlar.metre, excluded.metre),
        zaman = case when excluded.puan > skorlar.puan then now() else skorlar.zaman end;
  return true;
end $$;
revoke all on function public.skor_gonder(text, uuid, text, integer, integer) from public;
grant execute on function public.skor_gonder(text, uuid, text, integer, integer) to anon;
