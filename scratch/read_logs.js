const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();

  const res = await client.query('SELECT * FROM "NotificationLog" ORDER BY "sentAt" DESC LIMIT 5');
  console.log("LAST 5 NOTIFICATION LOGS:");
  console.log(JSON.stringify(res.rows, null, 2));

  await client.end();
}

main().catch(console.error);
