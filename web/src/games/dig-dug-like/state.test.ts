import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, COLS, ROWS } from "./state.js";
import type { TunnelDigState } from "./state.js";

// ─── 1. Initial state ─────────────────────────────────────────────────────────
describe("initialState", () => {
  it("has correct grid size and starting position", () => {
    const s = initialState(42);
    expect(s.dug.length).toBe(COLS * ROWS);
    expect(s.playerCol).toBe(1);
    expect(s.playerRow).toBe(1);
    expect(s.lives).toBe(3);
    expect(s.score).toBe(0);
    expect(s.lost).toBe(false);
    expect(s.won).toBe(false);
    expect(s.enemies.length).toBe(6);
  });
});

// ─── 2. Determinism ───────────────────────────────────────────────────────────
describe("determinism", () => {
  it("same seed gives same state", () => {
    expect(initialState(99)).toEqual(initialState(99));
  });
});

// ─── 3. Move digs tunnel ──────────────────────────────────────────────────────
describe("move", () => {
  it("moving right digs a new cell", () => {
    const s = initialState(42);
    const after = reducer(s, { type: "move", dir: "right" });
    expect(after.playerCol).toBe(2);
    // col=2, row=1: index = row*COLS + col = 1*COLS + 2
    expect(after.dug[1 * COLS + 2]).toBe(true);
  });
});

// ─── 4. Pump kills enemy at 3 pumps ──────────────────────────────────────────
describe("pump", () => {
  it("kills enemy after 3 pump ticks", () => {
    const s = initialState(42);
    // Place enemy right in front of player
    const modState: TunnelDigState = {
      ...s,
      playerCol: 1,
      playerRow: 1,
      playerDir: "right",
      enemies: [{ id: 0, col: 2, row: 1, alive: true, pumpCount: 0, pumpCooldown: 0 }],
    };
    const pumping = reducer(modState, { type: "pump-start" });
    expect(pumping.pumping).toBe(true);
    // Pump 3 times via tick
    let st = pumping;
    for (let i = 0; i < 3; i++) {
      st = reducer(st, { type: "tick", dt: 0.016 });
    }
    const enemy = st.enemies.find((e) => e.id === 0);
    expect(enemy?.alive).toBe(false);
    expect(st.score).toBeGreaterThan(0);
  });
});

// ─── 5. Win condition ─────────────────────────────────────────────────────────
describe("win", () => {
  it("won=true when all enemies dead", () => {
    const s: TunnelDigState = {
      ...initialState(42),
      enemies: [{ id: 0, col: 3, row: 3, alive: false, pumpCount: 0, pumpCooldown: 0 }],
    };
    const after = reducer(s, { type: "tick", dt: 0.016 });
    expect(after.won).toBe(true);
  });
});

// ─── 6. isTerminal ───────────────────────────────────────────────────────────
describe("isTerminal", () => {
  it("null when in progress", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });

  it("score on lost", () => {
    const s: TunnelDigState = { ...initialState(42), lost: true, score: 400 };
    expect(isTerminal(s)?.score).toBe(400);
  });

  it("score + lives bonus on won", () => {
    const s: TunnelDigState = { ...initialState(42), won: true, score: 600, lives: 2 };
    expect(isTerminal(s)?.score).toBe(1600);
  });
});
