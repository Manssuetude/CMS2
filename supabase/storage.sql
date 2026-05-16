insert into storage.buckets (id, name, public)
values ('manssuetude-media', 'manssuetude-media', true)
on conflict (id) do nothing;
