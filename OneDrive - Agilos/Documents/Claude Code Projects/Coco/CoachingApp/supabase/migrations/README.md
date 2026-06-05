# Supabase Migrations

## How to apply

1. Go to your Supabase project dashboard
2. Open **SQL Editor**
3. Paste the content of `001_schema.sql` and click **Run**

## After running the migration

Create your coach account:
1. Go to **Authentication > Users > Invite user** (your email)
2. Set password, then run in SQL Editor:
   ```sql
   update profiles set role = 'coach', name = 'Your Name' where email = 'your@email.com';
   ```

## Storage bucket

Create a bucket named `exercises` with **Public** access in **Storage > New bucket**.
