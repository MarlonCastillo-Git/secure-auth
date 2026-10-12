begin;
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
create policy "Read own profile" on public.profiles for select to authenticated
using ((select auth.uid()) = id);
create policy "Update own display name" on public.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create or replace function public.secure_auth_handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, display_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'display_name', ''),80));
  return new;
end;
$$;
revoke all on function public.secure_auth_handle_new_user() from public, anon, authenticated;
create trigger secure_auth_on_auth_user_created after insert on auth.users
for each row execute function public.secure_auth_handle_new_user();
-- Crea perfiles para las cuentas existentes sin cambiar datos ya guardados.
insert into public.profiles(id,display_name)
select id,left(coalesce(raw_user_meta_data ->> 'display_name',''),80) from auth.users
on conflict(id) do nothing;
commit;
