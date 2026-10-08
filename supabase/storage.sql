insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'manssuetude-media',
  'manssuetude-media',
  true,
  52428800, -- 50 Mo, aligné sur MAX_UPLOAD_BYTES (utils/uploadValidation.ts)
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/quicktime', 'video/webm',
    'audio/mpeg', 'audio/wav', 'audio/mp4',
    'application/pdf',
    'application/zip', 'application/x-zip-compressed', 'application/octet-stream',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
