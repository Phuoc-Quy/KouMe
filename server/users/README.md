# Users Service

This service exposes user-facing endpoints such as `GET /user/me` and verifies access tokens issued by the auths service.

## 1) Prerequisites

- Node.js 18+
- PostgreSQL running and reachable
- Redis running on `127.0.0.1:6379`
- A valid public JWT key matching the auths service private key

## 2) Public key setup

The users service does not need the private key. It only needs the public key that matches the auths private key.

Make sure the public key exists and points to the correct file. The recommended setup is to use the public key from the auths service:

```bash
ls -l /Users/your_name/Desktop/KouMe/server/auths/keys/public.key
```

If you need to regenerate it, do it from the auths service:

```bash
cd /Users/your_name/Desktop/KouMe/server/auths
mkdir -p keys
openssl genrsa -out keys/private.key 2048
openssl rsa -in keys/private.key -pubout -out keys/public.key
chmod 600 keys/private.key
chmod 644 keys/public.key
```

## 3) Environment setup

Create or update `.env` in this folder:

```env
PORT=3211
DATABASE_URL=postgresql://postgres:your_password@host:5432/postgres
REDIS_URL=redis://127.0.0.1:6379
JWT_PUBLIC_KEY_PATH=/Users/your_name/Desktop/KouMe/server/auths/keys/public.key
JWT_ISSUER=koume-auths
```

Notes:
- `JWT_PUBLIC_KEY_PATH` must be the absolute path to the public key
- `JWT_ISSUER` must match the issuer used when signing tokens in the auths service
- Do not put a different private key here; users only verifies tokens

## 4) Install dependencies

From the `server` folder:

```bash
npm install
```

## 5) Run the service

From `server/users`:

```bash
npm run dev
```

For production build:

```bash
npm run build
npm start
```

## 6) How the access token flow works

1. Auths service signs access tokens with the auths private key
2. Users service reads the access token from the request header
3. Users verifies the token with the auths public key
4. If valid, it returns the user profile from `GET /user/me`

Example request:

```http
GET /user/me
Authorization: Bearer <access_token>
```

## 7) Troubleshooting

### Invalid or expired access token

Common causes:
- `JWT_ISSUER` differs from the issuer used by auths
- `JWT_PUBLIC_KEY_PATH` is wrong or points to a different key
- the key file is missing or unreadable
- you restarted the service before `.env` was updated

### Quick verification

Run this in the terminal:

```bash
node -e "console.log(process.env.JWT_ISSUER); console.log(process.env.JWT_PUBLIC_KEY_PATH)"
```

Then confirm the file exists:

```bash
ls -l /Users/your_name/Desktop/KouMe/server/auths/keys/public.key
```

## 8) Testing

```bash
npm test
```
