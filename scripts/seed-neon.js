import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'database.json');
const initialData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

const sql = neon(process.env.DATABASE_URL);

async function seed() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS gravity_store (
        key VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL
      );
    `;

    await sql`
      INSERT INTO gravity_store (key, data)
      VALUES ('app_data', ${JSON.stringify(initialData)})
      ON CONFLICT (key) DO UPDATE SET data = ${JSON.stringify(initialData)};
    `;

    console.log('✅ Successfully seeded Neon database with Barbers, Services and Bookings!');
  } catch (err) {
    console.error('Seed error:', err);
  }
}

seed();
