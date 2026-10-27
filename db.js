const { Pool } = require("pg");

let pool;
let schemaReady;

function getPool() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is missing.");
    }
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === "production"
                ? { rejectUnauthorized: false }
                : false,
        });
    }
    return pool;
}

async function ensureSchema() {
    if (!schemaReady) {
        schemaReady = getPool().query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `).catch((error) => {
            schemaReady = null;
            throw error;
        });
    }
    await schemaReady;
}

async function findUserByEmail(email) {
    await ensureSchema();
    const result = await getPool().query(
        "SELECT id, email, password_hash, created_at FROM users WHERE email = $1",
        [email]
    );
    return result.rows[0] || null;
}

async function createUser({ id, email, passwordHash }) {
    await ensureSchema();
    const result = await getPool().query(
        `INSERT INTO users (id, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, email, created_at`,
        [id, email, passwordHash]
    );
    return result.rows[0];
}

module.exports = {
    createUser,
    findUserByEmail,
};
