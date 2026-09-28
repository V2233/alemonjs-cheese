-- 婚姻表（一条记录 = 一段婚姻，两个配偶平等）
CREATE TABLE IF NOT EXISTS marry_marriages (
  marriage_id  TEXT PRIMARY KEY,        -- 用双方 userId 排序后拼接，保证唯一
  spouse_a     TEXT NOT NULL,           -- userId 字典序较小的一方
  spouse_b     TEXT NOT NULL,           -- userId 字典序较大的一方
  favor        REAL NOT NULL DEFAULT 0, -- 亲密度，用 REAL 支持小数
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL,
  CHECK (spouse_a < spouse_b)           -- 强制 a < b，避免重复
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_marry_spouse_a ON marry_marriages(spouse_a);
CREATE UNIQUE INDEX IF NOT EXISTS idx_marry_spouse_b ON marry_marriages(spouse_b);
CREATE INDEX IF NOT EXISTS idx_marry_favor ON marry_marriages(favor DESC);

-- 孩子表（可选，为将来扩展留）
CREATE TABLE IF NOT EXISTS marry_children (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  marriage_id  TEXT NOT NULL,
  gender       INTEGER NOT NULL DEFAULT 2, -- 0女 1男 2其他
  name         TEXT NOT NULL,
  created_at   INTEGER NOT NULL,
  FOREIGN KEY (marriage_id) REFERENCES marry_marriages(marriage_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_marry_children_marriage ON marry_children(marriage_id);

-- 玩家档案（可选，先只放 gender / 未来财产等扩展字段）
CREATE TABLE IF NOT EXISTS marry_players (
  user_id      TEXT PRIMARY KEY,
  gender       INTEGER NOT NULL DEFAULT 2,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL
);

-- 亲密度操作 CD（避免重启失效）
CREATE TABLE IF NOT EXISTS marry_favor_cd (
  user_id      TEXT PRIMARY KEY,
  cd_until     INTEGER NOT NULL
);