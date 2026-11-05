import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.DATABASE_URL;
console.log('Connecting to Neon URL:', url.replace(/:[^:@]+@/, ':***@'));

const sql = neon(url);

async function main() {
  try {
    const res = await sql`SELECT 1 as connected, NOW() as server_time;`;
    console.log('✅ Neon DB Connection Success:', res);

    await sql`
      CREATE TABLE IF NOT EXISTS gravity_store (
        key VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL
      );
    `;
    console.log('✅ Table gravity_store created/verified on Neon!');

    const rows = await sql`SELECT key FROM gravity_store WHERE key = 'app_data';`;
    console.log('Existing records in Neon:', rows.length);
  } catch (err) {
    console.error('❌ Neon Error:', err);
  }
}

main();
