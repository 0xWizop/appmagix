# Login Setup Guide

To get the login working, follow these steps:

## 1. Database Setup

Ensure your `.env` has a valid PostgreSQL connection string:

```
DATABASE_URL="postgresql://username:password@localhost:5432/merchantmagix"
```

For local dev, you can use a free database from [Supabase](https://supabase.com) or [Neon](https://neon.tech).

## 2. Auth Configuration

Your `.env` should have:

```
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-secret-key-here"
```

Generate a secure secret: `openssl rand -base64 32`

## 3. Run Database Migrations

```bash
npm run db:push
```

This creates/updates your database tables.

## 4. Create a Test User

```bash
npm run db:seed
```

This creates a test account:

- **Email:** test@merchantmagix.com  
- **Password:** Test1234

## 5. Log In

1. Stop the dev server if it's running (Ctrl+C)
2. Run `npm run dev`
3. Go to http://localhost:3001/login
4. Sign in with the test credentials above

---

**Or create a new account:** Go to http://localhost:3001/register to sign up. Password must be 8+ chars with uppercase, lowercase, and number.
