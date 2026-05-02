import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  EXPORT_VERSION,
  KNOWN_KEYS,
  exportAll,
  exportFilename,
  getLastPlayed,
  getLastPlayedFor,
  importAll,
  recordLastPlayed,
} from "../src/platform/userdata.js";
import { recordPlayed } from "../src/platform/quickstart.js";

describe("platform/userdata", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
  });

  it("exportAll only includes recognized keys that are set", () => {
    localStorage.setItem("cards-bg-theme", "midnight");
    localStorage.setItem("cards-light-mode", "1");
    localStorage.setItem("unknown-key", "should not appear");

    const snapshot = exportAll();

    expect(snapshot.app).toBe("cards-and-such");
    expect(snapshot.version).toBe(EXPORT_VERSION);
    expect(snapshot.data["cards-bg-theme"]).toBe("midnight");
    expect(snapshot.data["cards-light-mode"]).toBe("1");
    expect(snapshot.data).not.toHaveProperty("unknown-key");
    // Skips keys that were never set.
    expect(snapshot.data).not.toHaveProperty("cards-card-back");
  });

  it("importAll restores recognized keys and skips unknown ones", () => {
    const payload = {
      version: 1,
      app: "cards-and-such",
      exportedAt: "2026-05-02T00:00:00.000Z",
      data: {
        "cards-bg-theme": "tundra",
        "cards-sound-on": "false",
        "evil-key": "boom",
        // wrong type — should be skipped without throwing
        "cards-card-back": 42,
      },
    };

    const result = importAll(payload);

    expect(result.ok).toBe(true);
    expect(result.written).toBe(2);
    expect(result.skipped).toBe(2);
    expect(localStorage.getItem("cards-bg-theme")).toBe("tundra");
    expect(localStorage.getItem("cards-sound-on")).toBe("false");
    expect(localStorage.getItem("evil-key")).toBeNull();
    expect(localStorage.getItem("cards-card-back")).toBeNull();
  });

  it("importAll accepts a JSON string and rejects malformed input", () => {
    const json = JSON.stringify({
      app: "cards-and-such",
      data: { "cards-ratings": "{}" },
    });
    expect(importAll(json).ok).toBe(true);
    expect(localStorage.getItem("cards-ratings")).toBe("{}");

    expect(importAll("not json").ok).toBe(false);
    expect(importAll(null).ok).toBe(false);
    expect(importAll({ data: { foo: "bar" }, app: "other-app" }).ok).toBe(false);
    expect(importAll({ app: "cards-and-such" }).ok).toBe(false);
  });

  it("export round-trips through import", () => {
    for (const k of KNOWN_KEYS) {
      localStorage.setItem(k, `val:${k}`);
    }
    const snapshot = exportAll();
    localStorage.clear();
    const result = importAll(JSON.stringify(snapshot));
    expect(result.ok).toBe(true);
    expect(result.written).toBe(KNOWN_KEYS.length);
    for (const k of KNOWN_KEYS) {
      expect(localStorage.getItem(k)).toBe(`val:${k}`);
    }
  });

  it("exportFilename uses YYYY-MM-DD", () => {
    const name = exportFilename(new Date("2026-05-02T12:34:56Z"));
    expect(name).toMatch(/^cards-and-such-data-2026-05-0[12]\.json$/);
  });

  it("recordLastPlayed stamps a near-now timestamp readable via getLastPlayedFor", () => {
    const before = Date.now();
    recordLastPlayed("foo");
    const after = Date.now();
    const ts = getLastPlayedFor("foo");
    expect(typeof ts).toBe("number");
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
    expect(getLastPlayed()).toEqual({ foo: ts });
    expect(getLastPlayedFor("never-played")).toBeUndefined();
  });

  it("recordPlayed (quickstart) writes through to cards-last-played", () => {
    const before = Date.now();
    recordPlayed("foo");
    const ts = getLastPlayedFor("foo");
    expect(typeof ts).toBe("number");
    expect((ts ?? 0) - before).toBeLessThan(5_000);
  });

  it("getLastPlayed tolerates corrupt JSON and bad shapes", () => {
    localStorage.setItem("cards-last-played", "not json");
    expect(getLastPlayed()).toEqual({});
    localStorage.setItem("cards-last-played", JSON.stringify(["array", "not", "object"]));
    expect(getLastPlayed()).toEqual({});
    localStorage.setItem("cards-last-played", JSON.stringify({ a: 1, b: "bad", c: 2 }));
    expect(getLastPlayed()).toEqual({ a: 1, c: 2 });
  });
});
