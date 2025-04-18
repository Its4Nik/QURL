import { Database } from "bun:sqlite";

const db = new Database("shortener.db");

db.query(
  `
  CREATE TABLE IF NOT EXISTS short_urls (
    code TEXT PRIMARY KEY,
    original_url TEXT NOT NULL,
    visits INTEGER DEFAULT 0,
    qr_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`,
).run();

export type database = {
  code: string;
  original_url: string;
  visits: string;
  qr_path: string;
  created_at: string;
};

export default db;
