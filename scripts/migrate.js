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

    // 4. Clean up duplicate continue_watching entries before creating unique index
    console.log('Deduplicating continue_watching table...');
    await client.query(`
      DELETE FROM public.continue_watching c1
      USING public.continue_watching c2
      WHERE c1.user_id = c2.user_id
        AND c1.tmdb_id = c2.tmdb_id
        AND c1.type = c2.type
        AND (
          c1.last_watched_at < c2.last_watched_at
          OR (c1.last_watched_at = c2.last_watched_at AND c1.id < c2.id)
        );
    `);

    // 5. Create unique index for continue_watching (user_id, tmdb_id, type)
    console.log('Creating unique index on continue_watching (user_id, tmdb_id, type)...');
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS continue_watching_user_tmdb_type_idx 
      ON public.continue_watching (user_id, tmdb_id, type);
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
