// scratch/promote-member.js
const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  
  // Promote the first member to GUILD_MASTER and status ACTIVE
  const res = await client.query(`
    UPDATE "Member" 
    SET role = 'GUILD_MASTER', status = 'ACTIVE' 
    WHERE nickname = 'ดา' 
    RETURNING id, "inGameName", nickname, role, status;
  `);
  
  console.log("Updated Member:", res.rows);
  await client.end();
}

run().catch(console.error);
