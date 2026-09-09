-- Storage for recipe photos uploaded through the add and edit forms.
--
-- The bucket is public because recipe images are shown to every visitor;
-- writing to it is restricted to admins, matching who can reach the forms.

insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

-- Uploading. `exists (select 1 from public.admins)` leans on the RLS already
-- on that table: a non-admin sees zero rows, so the check fails for them.
drop policy if exists "Admins can upload recipe images" on storage.objects;
create policy "Admins can upload recipe images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'recipe-images'
  and exists (select 1 from public.admins)
);

-- Deleting, for the cleanup that runs when a recipe is deleted, an edit
-- replaces an image, or a draft is abandoned.
drop policy if exists "Admins can delete recipe images" on storage.objects;
create policy "Admins can delete recipe images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'recipe-images'
  and exists (select 1 from public.admins)
);
