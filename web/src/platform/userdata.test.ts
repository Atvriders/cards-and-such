import { beforeEach, describe, expect, it } from "vitest";
import {
  EXPORT_VERSION,
  exportAll,
  exportFilename,
  importAll,
  toggleFavorite,
  readFavorites,
  isFavorite,
  bumpSessionCount,
  getSessionCount,
} from "./userdata.js";

beforeEach(() => {
  localStorage.clear();
});

describe("userdata export/import round-trip", () => {
  it("exports only KNOWN keys and round-trips them through importAll", () => {
    // Seed a mix of known + unknown keys.
    localStorage.setItem("cards-favorites", JSON.stringify(["klondike", "spider"]));
    localStorage.setItem("cards-bg-theme", "midnight");
    localStorage.setItem("cards-session-count", "7");
    // Unknown key should NOT appear in export.
    localStorage.setItem("totally-unrelated-key", "leakage");

    const snap = exportAll();
    expect(snap.version).toBe(EXPORT_VERSION);
    expect(snap.app).toBe("cards-and-such");
    expect(snap.data["cards-favorites"]).toBe(JSON.stringify(["klondike", "spider"]));
    expect(snap.data["cards-bg-theme"]).toBe("midnight");
    expect(snap.data["cards-session-count"]).toBe("7");
    expect(snap.data["totally-unrelated-key"]).toBeUndefined();
    // exportedAt is a valid ISO timestamp.
    expect(Number.isNaN(Date.parse(snap.exportedAt))).toBe(false);

    // Wipe + restore via importAll (string form) and confirm values land.
    localStorage.clear();
    const result = importAll(JSON.stringify(snap));
    expect(result.ok).toBe(true);
    expect(result.written).toBe(3);
    expect(localStorage.getItem("cards-favorites")).toBe(
      JSON.stringify(["klondike", "spider"]),
    );
    expect(localStorage.getItem("cards-bg-theme")).toBe("midnight");
    expect(localStorage.getItem("cards-session-count")).toBe("7");
  });

  it("rejects malformed payloads and silently skips unknown / non-string entries", () => {
    // Invalid JSON string.
    expect(importAll("{not json")).toMatchObject({ ok: false, error: "Invalid JSON" });
    // Wrong app marker.
    expect(importAll({ app: "some-other-app", data: {} })).toMatchObject({
      ok: false,
      error: expect.stringContaining("Wrong app"),
    });
    // Missing data field.
    expect(importAll({ app: "cards-and-such" })).toMatchObject({
      ok: false,
      error: "Missing data field",
    });

    // Valid envelope with a mix of known string, unknown key, and non-string value.
    const r = importAll({
      app: "cards-and-such",
      data: {
        "cards-bg-theme": "ocean",     // known + string -> written
        "cards-favorites": 42,          // known + non-string -> skipped
        "evil-unknown-key": "payload",  // unknown -> skipped
      },
    });
    expect(r.ok).toBe(true);
    expect(r.written).toBe(1);
    expect(r.skipped).toBe(2);
    expect(localStorage.getItem("cards-bg-theme")).toBe("ocean");
    expect(localStorage.getItem("evil-unknown-key")).toBeNull();
    expect(localStorage.getItem("cards-favorites")).toBeNull();
  });
});

describe("userdata small helpers", () => {
  it("toggleFavorite flips state and persists, and bumpSessionCount increments", () => {
    // Favorites: starts empty.
    expect(isFavorite("klondike")).toBe(false);
    expect(toggleFavorite("klondike")).toBe(true);
    expect(readFavorites().has("klondike")).toBe(true);
    // Second toggle removes it.
    expect(toggleFavorite("klondike")).toBe(false);
    expect(readFavorites().has("klondike")).toBe(false);

    // Session counter: 0 -> 1 -> 2 and persists across reads.
    expect(getSessionCount()).toBe(0);
    expect(bumpSessionCount()).toBe(1);
    expect(bumpSessionCount()).toBe(2);
    expect(getSessionCount()).toBe(2);
    expect(localStorage.getItem("cards-session-count")).toBe("2");

    // exportFilename uses local date parts in YYYY-MM-DD form.
    const name = exportFilename(new Date(2026, 4, 11)); // May 11 2026 local
    expect(name).toBe("cards-and-such-data-2026-05-11.json");
  });
});
