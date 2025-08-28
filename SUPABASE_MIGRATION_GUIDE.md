# Supabase Migration Guide

This guide will help you migrate from file-based user storage to Supabase for production deployment.

## 📋 Overview

Your Menu Analyzer app currently uses:
- ✅ **Development**: JSON file storage (`users.json`)
- ✅ **Production**: Supabase database (with fallback to file storage)

## 🚀 Step 1: Set Up Supabase Table

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Table Editor**
4. Click **"New Table"**
5. Copy and paste this SQL into the **SQL Editor**:

```sql
-- Create users table for Menu Analyzer
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to manage all users (for API operations)
CREATE POLICY "Service role can manage all users" ON users
    FOR ALL USING (auth.role() = 'service_role');
```

6. Click **Run** to execute the SQL

### Option B: Using the provided SQL file

1. Use the `supabase-setup.sql` file in your project root
2. Copy the contents and run it in Supabase SQL Editor

## 🔄 Step 2: Migrate Existing Users

### Run the Migration Script

1. **Install dependencies** (if not already installed):
   ```bash
   npm install dotenv
   ```

2. **Run the migration**:
   ```bash
   node migrate-users.js
   ```

The script will:
- ✅ Read users from `users.json`
- ✅ Check for existing users in Supabase
- ✅ Migrate only new users
- ✅ Create a backup of your JSON file
- ✅ Show migration progress

### Expected Output:
```
🚀 Starting user migration from users.json to Supabase...
📄 Found 4 users in users.json
📊 Found 0 existing users in Supabase
📦 Migrating 4 new users...
✅ Migrated batch: 4 users (4/4 total)
🎉 Migration complete! Successfully migrated 4 users.
📊 Total users in Supabase: 4
💾 Created backup: users.json.backup.1756200000000
```

## 🧪 Step 3: Test Your Application

### Test These Features:

1. **Sign Up**: Create a new user account
   - Should work and store in Supabase
   - Should send welcome email

2. **Login**: Use existing credentials
   - Should authenticate against Supabase
   - Should create session

3. **Password Reset**: 
   - Request reset via email
   - Use reset link from Gmail
   - Should update password in Supabase

4. **Profile Update**:
   - Update name, business name, phone
   - Should save changes to Supabase

### Verify in Supabase Dashboard:
1. Go to **Table Editor** → **users**
2. Check that your users are listed
3. Verify new signups appear here
4. Confirm password updates work

## 🔧 How It Works

### Development (Local):
- Primary: Supabase (if configured)
- Fallback: `users.json` file

### Production (Vercel):
- Primary: Supabase database
- Fallback: Error message (files are read-only)

### Code Changes Made:

1. **Created**: `/src/lib/supabase-auth.ts`
   - User CRUD operations
   - Password management
   - Profile updates

2. **Updated API Routes**:
   - `/api/auth/login` - Uses Supabase
   - `/api/auth/signup` - Uses Supabase  
   - `/api/profile` - Uses Supabase
   - `/api/reset-password` - Uses Supabase
   - `/api/send-reset-email` - Uses Supabase

3. **Maintained Compatibility**:
   - Development still works with JSON files
   - Production uses Supabase
   - Graceful fallbacks

## 📊 Verification Checklist

- [ ] Supabase table created successfully
- [ ] Migration script ran without errors
- [ ] Existing users can log in
- [ ] New users can sign up
- [ ] Password reset works end-to-end
- [ ] Profile updates save to Supabase
- [ ] No console errors in browser
- [ ] Vercel deployment works

## 🚨 Troubleshooting

### Migration Script Fails:
```bash
❌ Missing Supabase environment variables
```
**Solution**: Check your `.env.local` file has:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Login/Signup Fails:
```
Error: getUserByEmail failed
```
**Solution**: 
1. Verify Supabase table exists
2. Check Row Level Security policies
3. Confirm service role key is correct

### Password Reset Fails:
```
Error: Failed to update password
```
**Solution**:
1. Check Supabase connection
2. Verify users table has update permissions
3. Check console logs for detailed errors

## 🎯 Next Steps

After successful migration:

1. **Test thoroughly** in both development and production
2. **Remove users.json** file (after confirming everything works)
3. **Consider password hashing** (currently stored as plain text)
4. **Add user authentication** with Supabase Auth (optional upgrade)

## 🔒 Security Notes

- Passwords are currently stored as plain text
- Consider implementing bcrypt hashing
- Row Level Security is enabled but uses service role for API operations
- Reset tokens are stored in memory (consider database storage for production)

## 🆘 Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify environment variables are set correctly
3. Test Supabase connection directly in dashboard
4. Review the migration script output for clues