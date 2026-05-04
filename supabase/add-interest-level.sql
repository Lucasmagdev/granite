alter table public.estimate_requests
  add column if not exists interest_level text;

do $$
begin
  alter table public.estimate_requests
    add constraint estimate_requests_interest_level_check
    check (interest_level in ('hot', 'warm', 'cold'));
exception
  when duplicate_object then null;
end $$;
