// scratch/check-member.js
const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  const res = await client.query('SELECT id, "inGameName", nickname, status FROM "Member";');
  console.log("Members in DB:", res.rows);
  await client.end();
}

run().catch(console.error);
