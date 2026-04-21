import type Database from "better-sqlite3";

export const MIGRATIONS: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS users (
     username   TEXT PRIMARY KEY,
     created_at INTEGER NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS scores (
     id            INTEGER PRIMARY KEY AUTOINCREMENT,
     game_id       TEXT    NOT NULL,
     username      TEXT    NOT NULL REFERENCES users(username),
     score         INTEGER NOT NULL,
     settings_hash TEXT    NOT NULL,
     played_at     INTEGER NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS scores_by_game
     ON scores(game_id, settings_hash, score DESC)`,
  `CREATE INDEX IF NOT EXISTS scores_by_user ON scores(username)`,
  `CREATE TABLE IF NOT EXISTS ratings (
     game_id      TEXT NOT NULL,
     username     TEXT NOT NULL REFERENCES users(username),
     elo          INTEGER NOT NULL DEFAULT 1000,
     games_played INTEGER NOT NULL DEFAULT 0,
     PRIMARY KEY (game_id, username)
   )`,
];

export function runMigrations(db: Database.Database): void {
  const runOne = (sql: string): void => { db.prepare(sql).run(); };
  db.transaction(() => {
    for (const sql of MIGRATIONS) runOne(sql);
  })();
}
