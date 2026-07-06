const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to the Postgres database using the secret address Railway gives us
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(express.static('public'));
app.use(express.json());

// Make sure our table exists (runs once when the app starts)
async function setupDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS counter (
      id SERIAL PRIMARY KEY,
      count INTEGER NOT NULL
    );
  `);

  // If the table is empty, start the count at 0
  const result = await pool.query('SELECT * FROM counter LIMIT 1');
  if (result.rows.length === 0) {
    await pool.query('INSERT INTO counter (count) VALUES (0)');
  }
}

// API route: get the current count
app.get('/api/count', async (req, res) => {
  const result = await pool.query('SELECT count FROM counter LIMIT 1');
  res.json({ count: result.rows[0].count });
});

// API route: increase the count by 1
app.post('/api/increment', async (req, res) => {
  const result = await pool.query(
    'UPDATE counter SET count = count + 1 WHERE id = (SELECT id FROM counter LIMIT 1) RETURNING count'
  );
  res.json({ count: result.rows[0].count });
});

setupDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
