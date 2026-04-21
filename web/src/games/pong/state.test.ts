import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { PongState } from "./state.js";
import { PADDLE_HALF, BALL_RADIUS, PLAYER_X, BOT_X, PADDLE_WIDTH } from "./state.js";

const defaultSettings = { difficulty: "medium" as const, targetScore: "11" as const };

describe("initialState", () => {
  it("ball starts at center, game not yet over", () => {
    const s = initialState(42, defaultSettings);
    expect(s.ballX).toBeCloseTo(0.5);
    expect(s.ballY).toBeCloseTo(0.5);
    expect(s.over).toBe(false);
    expect(s.playerScore).toBe(0);
    expect(s.botScore).toBe(0);
  });

  it("targetScore parsed from settings string", () => {
    const s = initialState(1, { difficulty: "easy" as const, targetScore: "5" as const });
    expect(s.targetScore).toBe(5);
  });
});

describe("move action", () => {
  it("clamps player paddle to valid range", () => {
    const s = initialState(0, defaultSettings);
    const tooHigh = reducer(s, { type: "move", y: -1 });
    expect(tooHigh.playerY).toBeCloseTo(PADDLE_HALF);
    const tooLow = reducer(s, { type: "move", y: 2 });
    expect(tooLow.playerY).toBeCloseTo(1 - PADDLE_HALF);
    const valid = reducer(s, { type: "move", y: 0.3 });
    expect(valid.playerY).toBeCloseTo(0.3);
  });
});

describe("tick - ball bounces off top wall", () => {
  it("ball heading up near top bounces downward", () => {
    const base = initialState(0, defaultSettings);
    const s: PongState = {
      ...base,
      started: true,
      ballX: 0.5,
      ballY: BALL_RADIUS + 0.001,
      ballVx: 0,
      ballVy: -0.5,
    };
    const after = reducer(s, { type: "tick", dt: 0.016 });
    expect(after.ballVy).toBeGreaterThan(0); // bounced
  });
});

describe("tick - ball bounces off bottom wall", () => {
  it("ball heading down near bottom bounces upward", () => {
    const base = initialState(0, defaultSettings);
    const s: PongState = {
      ...base,
      started: true,
      ballX: 0.5,
      ballY: 1 - BALL_RADIUS - 0.001,
      ballVx: 0,
      ballVy: 0.5,
    };
    const after = reducer(s, { type: "tick", dt: 0.016 });
    expect(after.ballVy).toBeLessThan(0); // bounced
  });
});

describe("tick - bot scores when ball passes left", () => {
  it("bot score increments when ball passes player side", () => {
    const base = initialState(0, defaultSettings);
    const s: PongState = {
      ...base,
      started: true,
      ballX: 0.01,
      ballY: 0.5,
      ballVx: -1,
      ballVy: 0,
    };
    const after = reducer(s, { type: "tick", dt: 0.1 });
    expect(after.botScore).toBe(1);
    expect(after.playerScore).toBe(0);
    expect(after.ballX).toBeCloseTo(0.5); // reset
  });
});

describe("tick - player scores when ball passes right", () => {
  it("player score increments when ball passes bot side", () => {
    const base = initialState(0, defaultSettings);
    const s: PongState = {
      ...base,
      started: true,
      ballX: 0.99,
      ballY: 0.5,
      ballVx: 1,
      ballVy: 0,
    };
    const after = reducer(s, { type: "tick", dt: 0.1 });
    expect(after.playerScore).toBe(1);
    expect(after.botScore).toBe(0);
    expect(after.ballX).toBeCloseTo(0.5);
  });
});

describe("tick - player paddle bounce", () => {
  it("ball bouncing off player paddle reverses vx to positive", () => {
    const base = initialState(0, defaultSettings);
    const s: PongState = {
      ...base,
      started: true,
      ballX: PLAYER_X + PADDLE_WIDTH / 2 + BALL_RADIUS + 0.001,
      ballY: 0.5,
      playerY: 0.5,
      ballVx: -0.55,
      ballVy: 0,
    };
    const after = reducer(s, { type: "tick", dt: 0.016 });
    expect(after.ballVx).toBeGreaterThan(0);
  });
});

describe("isTerminal", () => {
  it("returns null when game is not over", () => {
    const s = initialState(0, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score 0 when bot wins", () => {
    const base = initialState(0, defaultSettings);
    const s: PongState = { ...base, over: true, winner: "bot", playerScore: 3, botScore: 11, targetScore: 11 };
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBe(0);
  });

  it("returns positive score when player wins", () => {
    const base = initialState(0, defaultSettings);
    const s: PongState = { ...base, over: true, winner: "player", playerScore: 11, botScore: 5, targetScore: 11 };
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBe(11 * 50 + (11 - 5) * 10); // 550 + 60 = 610
  });

  it("game ends when player reaches targetScore", () => {
    const base = initialState(0, { difficulty: "easy" as const, targetScore: "5" as const });
    // Simulate ball going past bot 5 times
    let s: PongState = { ...base, started: true, ballX: 0.99, ballY: 0.5, ballVx: 1, ballVy: 0, playerScore: 4 };
    s = reducer(s, { type: "tick", dt: 0.1 });
    expect(s.playerScore).toBe(5);
    expect(s.over).toBe(true);
    expect(s.winner).toBe("player");
  });
});
