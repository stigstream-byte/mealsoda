const db = require('../src/config/database');

async function syncSupabaseUsers() {
  console.log('Syncing existing Supabase users into public.users...');
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // 1. Update existing public.users rows with email, username, and password_hash from auth.users
    const updateResult = await client.query(`
      UPDATE public.users u
      SET 
        email = a.email,
        username = COALESCE(
          NULLIF(a.raw_user_meta_data->>'username', ''),
          NULLIF(a.raw_user_meta_data->>'name', ''),
          NULLIF(u.name, ''),
          SPLIT_PART(a.email, '@', 1)
        ),
        password_hash = a.encrypted_password
      FROM auth.users a
      WHERE u.id = a.id
        AND (u.password_hash IS NULL OR u.email IS NULL);
    `);
    console.log(`Updated ${updateResult.rowCount} existing users with password hashes and emails.`);

    // 2. Insert any missing users from auth.users into public.users
    const insertResult = await client.query(`
      INSERT INTO public.users (id, name, email, username, password_hash, created_at)
      SELECT 
        a.id,
        COALESCE(a.raw_user_meta_data->>'name', SPLIT_PART(a.email, '@', 1)),
        a.email,
        COALESCE(
          NULLIF(a.raw_user_meta_data->>'username', ''),
          NULLIF(a.raw_user_meta_data->>'name', ''),
          SPLIT_PART(a.email, '@', 1)
        ),
        a.encrypted_password,
        a.created_at
      FROM auth.users a
      LEFT JOIN public.users u ON u.id = a.id
      WHERE u.id IS NULL;
    `);
    console.log(`Inserted ${insertResult.rowCount} new users from auth.users into public.users.`);

    await client.query('COMMIT');
    console.log('Supabase user sync completed successfully!');

    // Check user Swift
    const checkSwift = await client.query(`
      SELECT id, name, username, email, (password_hash IS NOT NULL) as has_password
      FROM public.users
      WHERE LOWER(username) = 'swift' OR LOWER(email) LIKE '%swift%';
    `);
    console.log('User Swift check result:', checkSwift.rows);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error syncing Supabase users:', err);
  } finally {
    client.release();
    db.pool.end();
  }
}

syncSupabaseUsers();
