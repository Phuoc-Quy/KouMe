INSERT INTO users (
  username,
  email,
  password_hash,
  role
)
VALUES (
  'local_admin',
  'admin@example.test',
  'replace-with-a-valid-password-hash',
  'admin'
)
ON CONFLICT (username)
DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  updated_at = NOW();