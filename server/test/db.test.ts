import { describe, expect, it } from "vitest";
import { openDb } from "../src/db/index.js";
import { runMigrations } from "../src/db/migrations.js";

describe("openDb", () => {
  it("creates an in-memory DB with all tables", () => {
    const db = openDb(":memory:");
    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
      )
      .all() as { name: string }[];
    expect(tables.map((t) => t.name)).toEqual(["ratings", "scores", "users"]);
    db.close();
  });

  it("is idempotent — running migrations twice is safe", () => {
    const db = openDb(":memory:");
    expect(() => runMigrations(db)).not.toThrow();
    db.close();
  });
});
