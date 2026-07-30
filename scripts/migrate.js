const db = require('../src/config/database');

async function runMigration() {
  console.log('Starting PostgreSQL database migration...');
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // 1. Add missing auth columns to public.users
    console.log('Updating public.users schema...');
    await client.query(`
      ALTER TABLE public.users 
        ADD COLUMN IF NOT EXISTS email text UNIQUE,
        ADD COLUMN IF NOT EXISTS username text UNIQUE,
        ADD COLUMN IF NOT EXISTS password_hash text,
        ADD COLUMN IF NOT EXISTS refresh_token text;
    `);

    // Ensure gen_random_uuid default on id
    await client.query(`
      ALTER TABLE public.users ALTER COLUMN id SET DEFAULT gen_random_uuid();
    `);

    // 2. Drop constraints linking to Supabase auth.users
    console.log('Updating foreign key constraints...');
    await client.query(`
      ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
      ALTER TABLE public.continue_watching DROP CONSTRAINT IF EXISTS continue_watching_user_id_fkey;
      ALTER TABLE public.watchlist DROP CONSTRAINT IF EXISTS watchlist_user_id_fkey;
      ALTER TABLE public.banned_content DROP CONSTRAINT IF EXISTS banned_content_created_by_fkey;
    `);

    // 3. Re-add foreign keys pointing to public.users(id)
    await client.query(`
      ALTER TABLE public.continue_watching 
        ADD CONSTRAINT continue_watching_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

      ALTER TABLE public.watchlist 
        ADD CONSTRAINT watchlist_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

      ALTER TABLE public.banned_content 
        ADD CONSTRAINT banned_content_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;
    `);

    await client.query('COMMIT');
    console.log('Database migration completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    db.pool.end();
  }
}

runMigration();
