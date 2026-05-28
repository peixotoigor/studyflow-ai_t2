import 'dotenv/config';
import { Client } from 'pg';

async function testConnection(url: string, label: string) {
  console.log(`\n--- Testing ${label} ---`);
  console.log(`URL: ${url}`);
  const client = new Client({
    connectionString: url,
    connectionTimeoutMillis: 4000,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log(`Success connecting to ${label}!`);
    const res = await client.query('SELECT NOW()');
    console.log('Result:', res.rows[0]);
    return true;
  } catch (err: any) {
    console.error(`Failed to connect to ${label}:`, err.message || err);
    return false;
  } finally {
    await client.end();
  }
}

async function main() {
  const url1 = "postgresql://postgres.wstjsliciwookxhlaosv:k2lOCzMpWThH4UVO@aws-1-us-east-1.pooler.supabase.com:6543/postgres";
  const url2 = "postgresql://postgres.wstjsliciwookxhlaosv:k2lOCzMpWThH4UVO@aws-1-us-east-1.pooler.supabase.com:5432/postgres";
  const url3 = "postgresql://postgres.wstjsliciwookxhlaosv:k2lOCzMpWThH4UVO@db.wstjsliciwookxhlaosv.supabase.co:5432/postgres";

  await testConnection(url1, "Pooler Port 6543 (Transaction Mode)");
  await testConnection(url2, "Pooler Port 5432 (Session Mode)");
  await testConnection(url3, "Direct Connection Port 5432");
}

main();
