CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS formula_dbs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL
);



CREATE TABLE IF NOT EXISTS formulas (
    id UUID PRIMARY KEY,
    formula_db_id UUID REFERENCES formula_dbs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    value TEXT NOT NULL
);
