alter table public.estimate_requests
  drop constraint if exists estimate_requests_interest_level_check;

update public.estimate_requests
set interest_level = case
  when interest_level = 'cold' then '1'
  when interest_level = 'warm' then '2'
  when interest_level = 'hot' then '3'
  else interest_level
end;

alter table public.estimate_requests
  add constraint estimate_requests_interest_level_check
  check (interest_level in ('1', '2', '3'));
