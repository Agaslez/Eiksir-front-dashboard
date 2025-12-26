import Database from 'better-sqlite3';

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
const dbPath = dbUrl.replace('file:', '');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

console.log('Creating page_views table...');

db.exec(`
CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  screen_resolution TEXT,
  time_on_page INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`);

db.exec('CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);');
db.exec('CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);');
db.exec('CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);');

console.log('✅ page_views table created');
db.close();
