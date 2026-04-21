import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  PADDLE_Y,
  BALL_RADIUS,
  BRICK_AREA_Y_TOP,
  BRICK_AREA_Y_BOTTOM,
  BRICK_COLS,
} from "./state.js";
import type { BreakoutState } from "./state.js";

const defaultSettings = { difficulty: "medium" as const, rows: "5" as const };

// ─── 1. Initial state ─────────────────────────────────────────────────────────
describe("initialState", () => {
  it("paddle centered, ball on paddle, correct number of bricks", () => {
    const s = initialState(42, defaultSettings);
    expect(s.paddleX).toBe(0.5);
    expect(s.ballX).toBe(0.5);
    expect(s.ballY).toBeCloseTo(PADDLE_Y - BALL_RADIUS - 0.005, 8);
    expect(s.bricks.length).toBe(5 * BRICK_COLS);
    expect(s.bricks.every((b) => b.alive)).toBe(true);
    expect(s.lives).toBe(3);
    expect(s.score).toBe(0);
    expect(s.started).toBe(false);
    expect(s.lost).toBe(false);
    expect(s.won).toBe(false);
  });
});

// ─── 2. Determinism ───────────────────────────────────────────────────────────
describe("determinism", () => {
  it("produces identical state under the same seed", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1).toEqual(s2);
  });
});

// ─── 3. Release sets started and gives upward velocity ───────────────────────
describe("release", () => {
  it("sets started=true and vy < 0", () => {
    const s = initialState(42, defaultSettings);
    const after = reducer(s, { type: "release" });
    expect(after.started).toBe(true);
    expect(after.ballVy).toBeLessThan(0);
  });

  it("is a no-op when already started", () => {
    const s = initialState(42, defaultSettings);
    const started = reducer(s, { type: "release" });
    const again = reducer(started, { type: "release" });
    expect(again).toBe(started); // same reference
  });
});

// ─── 4. Tick when !started is a no-op ────────────────────────────────────────
describe("tick when not started", () => {
  it("returns the same state (ball does not move)", () => {
    const s = initialState(42, defaultSettings);
    const after = reducer(s, { type: "tick", dt: 0.016 });
    expect(after.ballX).toBe(s.ballX);
    expect(after.ballY).toBe(s.ballY);
  });
});

// ─── 5. Tick advances ball position ──────────────────────────────────────────
describe("tick advances ball", () => {
  it("ball moves by vx*dt and vy*dt", () => {
    const base = initialState(42, defaultSettings);
    // Manually set up a moving ball away from walls and bricks
    const s: BreakoutState = {
      ...base,
      started: true,
      ballX: 0.5,
      ballY: 0.6,
      ballVx: 0.1,
      ballVy: 0.2,
    };
    const dt = 0.1;
    const after = reducer(s, { type: "tick", dt });
    expect(after.ballX).toBeCloseTo(0.5 + 0.1 * dt, 6);
    expect(after.ballY).toBeCloseTo(0.6 + 0.2 * dt, 6);
  });
});

// ─── 6. Ball hits right wall → vx inverts ────────────────────────────────────
describe("right wall bounce", () => {
  it("inverts vx when ball hits right wall", () => {
    const base = initialState(42, defaultSettings);
    const s: BreakoutState = {
      ...base,
      started: true,
      ballX: 1 - BALL_RADIUS - 0.001,
      ballY: 0.6,
      ballVx: 0.5,
      ballVy: 0.1,
    };
    const after = reducer(s, { type: "tick", dt: 0.1 });
    expect(after.ballVx).toBeLessThan(0); // should have inverted
  });
});

// ─── 7. Ball hits top wall → vy inverts ──────────────────────────────────────
describe("top wall bounce", () => {
  it("inverts vy when ball hits top wall", () => {
    const base = initialState(42, defaultSettings);
    // Put ball just above bricks area to avoid brick collisions — use no bricks
    const s: BreakoutState = {
      ...base,
      started: true,
      ballX: 0.5,
      ballY: BALL_RADIUS + 0.001,
      ballVx: 0.05,
      ballVy: -0.5,
      bricks: [], // no bricks
    };
    const after = reducer(s, { type: "tick", dt: 0.1 });
    expect(after.ballVy).toBeGreaterThan(0); // bounced up → now going down
  });
});

// ─── 8. Ball hits a brick: brick dies, score increases ────────────────────────
describe("brick collision", () => {
  it("removes the brick and increments score by 10", () => {
    const base = initialState(42, defaultSettings);
    const brickHeight = (BRICK_AREA_Y_BOTTOM - BRICK_AREA_Y_TOP) / Number(defaultSettings.rows);
    const brickWidth = 1 / BRICK_COLS;

    // Place ball just above the center of brick (row=0, col=5)
    const brickTop = BRICK_AREA_Y_TOP;
    const brickCenterX = 5 * brickWidth + brickWidth / 2;

    const s: BreakoutState = {
      ...base,
      started: true,
      ballX: brickCenterX,
      ballY: brickTop - BALL_RADIUS - 0.001,
      ballVx: 0,
      ballVy: 0.5, // moving downward into the brick
    };

    const after = reducer(s, { type: "tick", dt: 0.1 });

    // The brick at row=0, col=5 should be dead
    const targetBrick = after.bricks.find((b) => b.row === 0 && b.col === 5);
    expect(targetBrick?.alive).toBe(false);
    expect(after.score).toBe(10);
  });
});

// ─── 9. Ball falls below: lives > 1 decrements lives, resets ball ─────────────
describe("ball falls below with lives > 1", () => {
  it("decrements lives, resets ball, sets started=false", () => {
    const base = initialState(42, defaultSettings);
    // Place paddle far to the right so ball at x=0.05 misses it completely
    const s: BreakoutState = {
      ...base,
      started: true,
      lives: 2,
      paddleX: 0.9,
      ballX: 0.05,
      ballY: 0.99,
      ballVx: 0,
      ballVy: 0.5,
    };
    const after = reducer(s, { type: "tick", dt: 0.1 });
    expect(after.lives).toBe(1);
    expect(after.started).toBe(false);
    expect(after.lost).toBe(false);
    expect(after.ballVx).toBe(0);
    expect(after.ballVy).toBe(0);
  });
});

// ─── 10. Ball falls below with lives=1: lost=true ────────────────────────────
describe("ball falls below with lives=1", () => {
  it("sets lost=true", () => {
    const base = initialState(42, defaultSettings);
    // Place paddle far to the right so ball at x=0.05 misses it completely
    const s: BreakoutState = {
      ...base,
      started: true,
      lives: 1,
      paddleX: 0.9,
      ballX: 0.05,
      ballY: 0.99,
      ballVx: 0,
      ballVy: 0.5,
    };
    const after = reducer(s, { type: "tick", dt: 0.1 });
    expect(after.lost).toBe(true);
    expect(after.lives).toBe(0);
  });
});

// ─── 11. All bricks destroyed: won=true ──────────────────────────────────────
describe("win condition", () => {
  it("sets won=true when last brick is destroyed", () => {
    const base = initialState(42, defaultSettings);
    const brickHeight = (BRICK_AREA_Y_BOTTOM - BRICK_AREA_Y_TOP) / Number(defaultSettings.rows);
    const brickWidth = 1 / BRICK_COLS;

    // Kill all bricks except (row=0, col=0)
    const almostDeadBricks = base.bricks.map((b) =>
      b.row === 0 && b.col === 0 ? b : { ...b, alive: false },
    );

    // Position ball to hit brick (row=0, col=0)
    const brickTop = BRICK_AREA_Y_TOP;
    const brickCenterX = 0 * brickWidth + brickWidth / 2;

    const s: BreakoutState = {
      ...base,
      started: true,
      bricks: almostDeadBricks,
      ballX: brickCenterX,
      ballY: brickTop - BALL_RADIUS - 0.001,
      ballVx: 0,
      ballVy: 0.5,
    };

    const after = reducer(s, { type: "tick", dt: 0.1 });
    expect(after.won).toBe(true);
  });
});

// ─── 12. isTerminal ──────────────────────────────────────────────────────────
describe("isTerminal", () => {
  it("returns null when game is in progress", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score+lives*100 when won", () => {
    const base = initialState(42, defaultSettings);
    const s: BreakoutState = {
      ...base,
      won: true,
      score: 200,
      lives: 2,
    };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result?.score).toBe(200 + 2 * 100);
  });

  it("returns score when lost", () => {
    const base = initialState(42, defaultSettings);
    const s: BreakoutState = {
      ...base,
      lost: true,
      score: 150,
      lives: 0,
    };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result?.score).toBe(150);
  });
});
