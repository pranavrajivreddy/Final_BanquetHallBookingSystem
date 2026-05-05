const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const ensureDatabaseSchema = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      mobile VARCHAR(20) NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'customer'
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      date DATE NOT NULL,
      eventtype TEXT NOT NULL,
      decoration TEXT DEFAULT '',
      food TEXT DEFAULT '',
      guests INTEGER NOT NULL,
      requests TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'bookings'
          AND column_name = 'eventType'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'bookings'
          AND column_name = 'eventtype'
      ) THEN
        EXECUTE 'ALTER TABLE bookings RENAME COLUMN "eventType" TO eventtype';
      END IF;
    END
    $$;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_requests (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      mobile VARCHAR(20) NOT NULL UNIQUE,
      password TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

module.exports = pool;
module.exports.ensureDatabaseSchema = ensureDatabaseSchema;
