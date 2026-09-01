# Auths Service

This service handles authentication flows such as sign-up, login, refresh token, logout, forgot password, OTP, and session management.

## 1) Prerequisites

- Node.js 18+
- PostgreSQL running and reachable
- Redis running on `127.0.0.1:6379`
- A JWT RSA key pair generated locally

## 2) Generate JWT keys

From the `server/auths` folder:

```bash
mkdir -p keys
openssl genrsa -out keys/private.key 2048
openssl rsa -in keys/private.key -pubout -out keys/public.key
chmod 600 keys/private.key
chmod 644 keys/public.key
```

Important:
- `private.key` is used only by the auths service to sign tokens
- `public.key` is used by the users service to verify access tokens
- The public key must match the private key exactly

## 3) Environment setup

Copy `.env.example` to `.env` if needed, then fill in the values:

```env
PORT=3210
DATABASE_URL=postgresql://postgres:your_password@host:5432/postgres
REDIS_URL=redis://127.0.0.1:6379
OTP_SECRET=your_otp_secret
MAIL_USER=your@email.com
MAIL_PASSWORD=your_mail_password
JWT_PRIVATE_KEY_PATH=/Users/your_name/Desktop/KouMe/server/auths/keys/private.key
JWT_PUBLIC_KEY_PATH=/Users/your_name/Desktop/KouMe/server/auths/keys/public.key
JWT_ISSUER=koume-auths
```

Notes:
- Use absolute file paths for the key files to avoid path issues when the process runs from a different working directory.
- `JWT_ISSUER` must be the same value used by the users service when verifying tokens.

## 4) Install dependencies

From the `server` folder:

```bash
npm install
```

## 5) Run the service

From `server/auths`:

```bash
npm run dev
```

For production build:

```bash
npm run build
npm start
```

## 6) Useful checks

- Confirm the key files exist:

```bash
ls -l keys
```

- Confirm env values are loaded:

```bash
node -e "console.log(process.env.JWT_ISSUER, process.env.JWT_PUBLIC_KEY_PATH)"
```

## 7) Common issues

### Token verification fails in users service

Usually this means one of the following:
- `JWT_ISSUER` mismatch between auths and users
- `JWT_PUBLIC_KEY_PATH` points to a different key than the one auths signed with
- key path is relative and resolves from the wrong folder

The safest setup is:
- auths signs with `auths/keys/private.key`
- users verifies with `auths/keys/public.key`
- both services use `JWT_ISSUER=koume-auths`

## 8) Testing

```bash
npm test
```
