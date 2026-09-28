import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

import { pluginInfo } from '../../../package';

const dbDir = join(pluginInfo.DATA_PATH, 'marry-data');
if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });

const dbPath = join(dbDir, 'marryDB.sqlite');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');

db.exec(`--sql
  CREATE TABLE IF NOT EXISTS marry_marriages (
    marriage_id  TEXT PRIMARY KEY,
    spouse_a     TEXT NOT NULL,
    spouse_b     TEXT NOT NULL,
    favor        REAL NOT NULL DEFAULT 0,
    created_at   INTEGER NOT NULL,
    updated_at   INTEGER NOT NULL,
    CHECK (spouse_a < spouse_b)
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_marry_spouse_a ON marry_marriages(spouse_a);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_marry_spouse_b ON marry_marriages(spouse_b);
  CREATE INDEX IF NOT EXISTS idx_marry_favor ON marry_marriages(favor DESC);

  CREATE TABLE IF NOT EXISTS marry_children (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    marriage_id  TEXT NOT NULL,
    gender       INTEGER NOT NULL DEFAULT 2,
    name         TEXT NOT NULL,
    created_at   INTEGER NOT NULL,
    FOREIGN KEY (marriage_id) REFERENCES marry_marriages(marriage_id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_marry_children_marriage ON marry_children(marriage_id);

  CREATE TABLE IF NOT EXISTS marry_players (
    user_id      TEXT PRIMARY KEY,
    gender       INTEGER NOT NULL DEFAULT 2,
    created_at   INTEGER NOT NULL,
    updated_at   INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS marry_favor_cd (
    user_id      TEXT PRIMARY KEY,
    cd_until     INTEGER NOT NULL
  );
`);

// 定期清理过期 CD（可选，也可以在读的时候判断）
export function cleanExpiredCd(): void {
  db.prepare('DELETE FROM marry_favor_cd WHERE cd_until < ?').run(Date.now());
}
