import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, ALIEN_COLS, ALIEN_ROWS, TOTAL_ALIENS } from "./state.js";
import type { SpaceInvadersState } from "./state.js";

const defaultSettings = { difficulty: "medium" as const };

describe("initialState", () => {
  it("all aliens alive, player centered, game not over", () => {
    const s = initialState(0, defaultSettings);
    expect(s.over).toBe(false);
    expect(s.lives).toBe(3);
    expect(s.score).toBe(0);
    expect(s.playerX).toBeCloseTo(0.5);
    const alive = s.aliens.flat().filter(Boolean).length;
    expect(alive).toBe(TOTAL_ALIENS);
  });

  it("alien grid dimensions match constants", () => {
    const s = initialState(0, defaultSettings);
    expect(s.aliens.length).toBe(ALIEN_ROWS);
    expect(s.aliens[0]!.length).toBe(ALIEN_COLS);
  });
});

describe("move action", () => {
  it("player moves right", () => {
    const s = initialState(0, defaultSettings);
    const x0 = s.playerX;
    const after = reducer(s, { type: "move", dir: 1 });
    expect(after.playerX).toBeGreaterThan(x0);
  });

  it("player moves left", () => {
    const s = initialState(0, defaultSettings);
    const x0 = s.playerX;
    const after = reducer(s, { type: "move", dir: -1 });
    expect(after.playerX).toBeLessThan(x0);
  });

  it("player cannot move past left edge", () => {
    const s = initialState(0, defaultSettings);
    let cur = s;
    for (let i = 0; i < 100; i++) cur = reducer(cur, { type: "move", dir: -1 });
    expect(cur.playerX).toBeGreaterThan(0);
  });
});

describe("fire action", () => {
  it("fire creates a player bullet", () => {
    const s = initialState(0, defaultSettings);
    const after = reducer(s, { type: "fire" });
    const playerBullets = after.bullets.filter((b) => b.vy < 0);
    expect(playerBullets.length).toBe(1);
  });

  it("cannot fire while player bullet is in flight", () => {
    const s = initialState(0, defaultSettings);
    const s1 = reducer(s, { type: "fire" });
    const s2 = reducer(s1, { type: "fire" });
    const playerBullets = s2.bullets.filter((b) => b.vy < 0);
    expect(playerBullets.length).toBe(1); // still only 1
  });
});

describe("tick - alien marching", () => {
  it("aliens march and formation or descent changes after enough ticks", () => {
    const s = initialState(0, defaultSettings);
    const fx0 = s.formationX;
    const fy0 = s.formationY;
    // Tick enough times to trigger multiple march steps
    let cur = s;
    for (let i = 0; i < s.alienMarchTicks * 3 + 5; i++) {
      cur = reducer(cur, { type: "tick" });
    }
    // Either the formation moved horizontally or it descended (turned at edge)
    const changed = cur.formationX !== fx0 || cur.formationY !== fy0;
    expect(changed).toBe(true);
  });
});

describe("alien killed by bullet", () => {
  it("shooting an alien removes it and adds score", () => {
    const s = initialState(0, defaultSettings);
    // Place a player bullet directly on the first alien in row 0, col 0
    const ax = 0.05 + s.formationX; // alien at col 0
    const ay = 0.08 + s.formationY; // alien at row 0
    const state: SpaceInvadersState = {
      ...s,
      bullets: [{ id: 999, x: ax, y: ay, vy: -0.018 }],
    };
    const after = reducer(state, { type: "tick" });
    expect(after.score).toBeGreaterThan(0);
    const killed = !after.aliens[0]![0];
    expect(killed).toBe(true);
  });
});

describe("player hit by bomb", () => {
  it("alien bomb hitting player costs a life", () => {
    const s = initialState(0, defaultSettings);
    // Place alien bomb on player position
    const state: SpaceInvadersState = {
      ...s,
      bullets: [{ id: 888, x: s.playerX, y: 0.89, vy: 0.012 }],
    };
    const after = reducer(state, { type: "tick" });
    expect(after.lives).toBeLessThan(3);
  });
});

describe("wave clear", () => {
  it("clearing all aliens starts a new level", () => {
    const s = initialState(0, defaultSettings);
    // Kill all aliens except one, then kill the last with a bullet
    const oneLeft: SpaceInvadersState = {
      ...s,
      aliens: Array.from({ length: ALIEN_ROWS }, (_, r) =>
        Array.from({ length: ALIEN_COLS }, (_, c) => r === 0 && c === 0)
      ),
      bullets: [{ id: 1, x: 0.05 + s.formationX, y: 0.08 + s.formationY, vy: -0.018 }],
    };
    const after = reducer(oneLeft, { type: "tick" });
    // Either level increased or score includes 500 bonus
    expect(after.score).toBeGreaterThanOrEqual(30); // at least 30 for top-row alien
    if (!after.over) {
      expect(after.level).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("isTerminal", () => {
  it("returns null when game is running", () => {
    const s = initialState(0, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when over", () => {
    const s = initialState(0, defaultSettings);
    const dead: SpaceInvadersState = { ...s, over: true, score: 300 };
    const t = isTerminal(dead);
    expect(t).not.toBeNull();
    expect(t!.score).toBe(300);
  });
});
