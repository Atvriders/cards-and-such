import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { SnakeState } from "./state.js";

const defaultSettings = { gridSize: "20" as const, speed: "medium" as const, wrap: false };

// ─── 1. Initial state ────────────────────────────────────────────────────────
describe("initialState", () => {
  it("snake length is 3, alive, direction right, food not on snake", () => {
    const s = initialState(42, defaultSettings);
    expect(s.snake.length).toBe(3);
    expect(s.alive).toBe(true);
    expect(s.direction).toBe("right");
    const onSnake = s.snake.some((c) => c.row === s.food.row && c.col === s.food.col);
    expect(onSnake).toBe(false);
  });
});

// ─── 2. Determinism ──────────────────────────────────────────────────────────
describe("determinism", () => {
  it("produces identical state under the same seed", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1).toEqual(s2);
  });
});

// ─── 3. Tick without food ────────────────────────────────────────────────────
describe("tick without food", () => {
  it("head advances, tail retracts, length unchanged", () => {
    // Put food far away so tick doesn't eat it
    const base = initialState(42, defaultSettings);
    // Override food to bottom-right corner (far from snake)
    const s: SnakeState = { ...base, food: { row: base.gridSize - 1, col: base.gridSize - 1 } };
    const after = reducer(s, { type: "tick" });
    expect(after.snake.length).toBe(3);
    expect(after.snake[0]!.col).toBe(s.snake[0]!.col + 1); // head moved right
    // Tail should be gone
    const oldTail = s.snake[s.snake.length - 1]!;
    const tailStillPresent = after.snake.some((c) => c.row === oldTail.row && c.col === oldTail.col);
    expect(tailStillPresent).toBe(false);
  });
});

// ─── 4. Eat food → grow ───────────────────────────────────────────────────────
describe("tick with food on new head", () => {
  it("snake grows by 1 and new food spawns", () => {
    const base = initialState(42, defaultSettings);
    const head = base.snake[0]!;
    // Place food one step ahead (to the right)
    const s: SnakeState = { ...base, food: { row: head.row, col: head.col + 1 } };
    const after = reducer(s, { type: "tick" });
    expect(after.snake.length).toBe(4);
    // New food should not equal old food
    const newFoodSameAsOld = after.food.row === s.food.row && after.food.col === s.food.col;
    expect(newFoodSameAsOld).toBe(false);
  });
});

// ─── 5. Tick into wall (wrap=false) → dead ────────────────────────────────────
describe("wall collision (wrap=false)", () => {
  it("alive becomes false when head hits a wall", () => {
    const base = initialState(42, defaultSettings);
    const gs = base.gridSize;
    // Move snake head to the right edge
    const head = { row: 5, col: gs - 1 };
    const s: SnakeState = {
      ...base,
      snake: [head, { row: 5, col: gs - 2 }, { row: 5, col: gs - 3 }],
      direction: "right",
      nextDirection: "right",
      food: { row: 0, col: 0 },
    };
    const after = reducer(s, { type: "tick" });
    expect(after.alive).toBe(false);
  });
});

// ─── 6. Tick into wall (wrap=true) → wrap around ─────────────────────────────
describe("wall wrap (wrap=true)", () => {
  it("head wraps to opposite edge; alive stays true", () => {
    const wrapSettings = { ...defaultSettings, wrap: true };
    const base = initialState(42, wrapSettings);
    const gs = base.gridSize;
    // Head at right edge moving right
    const s: SnakeState = {
      ...base,
      snake: [{ row: 5, col: gs - 1 }, { row: 5, col: gs - 2 }, { row: 5, col: gs - 3 }],
      direction: "right",
      nextDirection: "right",
      food: { row: 0, col: 0 },
    };
    const after = reducer(s, { type: "tick" });
    expect(after.alive).toBe(true);
    expect(after.snake[0]!.col).toBe(0); // wrapped to left edge
    expect(after.snake[0]!.row).toBe(5);
  });
});

// ─── 7. Self-collision → dead ─────────────────────────────────────────────────
describe("self collision", () => {
  it("alive becomes false when head hits body", () => {
    const base = initialState(42, defaultSettings);
    // Construct a U-shape so the next tick collides
    // Snake going up: head at (5,5), body at (4,5),(3,5)
    // Turn left → next head at (5,4)... let's use a different setup:
    // Snake: head(5,5), (5,6), (4,6), (4,5) going left — next head = (5,4) no collision
    // Simpler: manually place head where the next move hits an existing cell
    // Snake going right: head(5,5), body (5,4),(5,3). Turn down, tick, turn left, tick, tick → hits body
    // Easiest: place a 5-cell snake in a tight square so next tick self-collides
    const s: SnakeState = {
      ...base,
      snake: [
        { row: 5, col: 5 }, // head moving right
        { row: 5, col: 4 },
        { row: 4, col: 4 },
        { row: 4, col: 5 },
        { row: 4, col: 6 },
      ],
      direction: "right",
      nextDirection: "right",
      food: { row: 0, col: 0 },
      // next tick head goes to (5,6), which is not on snake
      // but if we set direction up and nextDirection up, head goes to (4,5) which is on snake
    };
    // Turn up so head moves to (4,5) which is body
    const turned: SnakeState = { ...s, direction: "up", nextDirection: "up" };
    const after = reducer(turned, { type: "tick" });
    expect(after.alive).toBe(false);
  });
});

// ─── 8. 180° turn is rejected ────────────────────────────────────────────────
describe("180 degree turn rejection", () => {
  it("going right, turning left is rejected; direction stays right on next tick", () => {
    const base = initialState(42, defaultSettings);
    const s: SnakeState = {
      ...base,
      snake: [{ row: 5, col: 5 }, { row: 5, col: 4 }, { row: 5, col: 3 }],
      direction: "right",
      nextDirection: "right",
      food: { row: 0, col: 0 },
    };
    // Try to turn left (opposite of right)
    const afterTurn = reducer(s, { type: "turn", direction: "left" });
    // nextDirection should still be right (turn rejected)
    expect(afterTurn.nextDirection).toBe("right");
    // Tick should still move right
    const afterTick = reducer(afterTurn, { type: "tick" });
    expect(afterTick.snake[0]!.col).toBe(6); // moved right
    expect(afterTick.direction).toBe("right");
  });
});

// ─── 9. isTerminal ───────────────────────────────────────────────────────────
describe("isTerminal", () => {
  it("returns null when alive", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns { score } equal to snake.length when dead", () => {
    const base = initialState(42, defaultSettings);
    const gs = base.gridSize;
    // Kill the snake by hitting a wall
    const s: SnakeState = {
      ...base,
      snake: [{ row: 5, col: gs - 1 }, { row: 5, col: gs - 2 }, { row: 5, col: gs - 3 }],
      direction: "right",
      nextDirection: "right",
      food: { row: 0, col: 0 },
    };
    const dead = reducer(s, { type: "tick" });
    expect(dead.alive).toBe(false);
    const terminal = isTerminal(dead);
    expect(terminal).not.toBeNull();
    expect(terminal?.score).toBe(dead.snake.length);
  });
});
