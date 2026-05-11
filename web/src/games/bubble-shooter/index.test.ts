import { describe, it, expect } from "vitest";
import { bubbleShooterPlugin } from "./index.js";
import type { BubbleShooterState } from "./state.js";

const S = { colors: "4" } as const;

describe("bubble-shooter plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bubbleShooterPlugin.id).toBe("bubble-shooter");
    expect(bubbleShooterPlugin.title).toBe("Bubble Shooter");
    expect(bubbleShooterPlugin.category).toBe("board");
    expect(bubbleShooterPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bubbleShooterPlugin.description).toBe("string");
    expect(bubbleShooterPlugin.description.length).toBeGreaterThan(0);
    expect(bubbleShooterPlugin.settings).toBeDefined();
    expect(typeof bubbleShooterPlugin.settings).toBe("object");
    expect(bubbleShooterPlugin.settings.colors.kind).toBe("enum");
    expect(typeof bubbleShooterPlugin.initialState).toBe("function");
    expect(typeof bubbleShooterPlugin.reducer).toBe("function");
    expect(typeof bubbleShooterPlugin.isTerminal).toBe("function");
    expect(bubbleShooterPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh board", () => {
    const a = bubbleShooterPlugin.initialState(42, S);
    const b = bubbleShooterPlugin.initialState(42, S);
    expect(a.grid).toEqual(b.grid);
    expect(a.currentBubble).toBe(b.currentBubble);
    expect(a.rows).toBe(b.rows);
    expect(a.cols).toBe(b.cols);
    expect(a.shots).toBe(0);
    expect(a.won).toBe(false);
    expect(a.lost).toBe(false);
    expect(a.angle).toBe(0);
    expect(bubbleShooterPlugin.isTerminal(a)).toBeNull();

    // Different seed should still produce a non-terminal state.
    const c = bubbleShooterPlugin.initialState(7, S);
    expect(bubbleShooterPlugin.isTerminal(c)).toBeNull();
  });

  it("hint returns a HintTarget on fresh state and null on terminal state", () => {
    expect(typeof bubbleShooterPlugin.hint).toBe("function");
    const state = bubbleShooterPlugin.initialState(5, S);
    const result = bubbleShooterPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-bubble-shooter-action"]');
    expect(result!.pulses).toBe(3);

    // Force terminal (won) -> hint must return null.
    const wonState: BubbleShooterState = { ...state, won: true };
    expect(bubbleShooterPlugin.isTerminal(wonState)).not.toBeNull();
    expect(bubbleShooterPlugin.hint!(wonState)).toBeNull();

    // Force terminal (lost) -> hint must return null.
    const lostState: BubbleShooterState = { ...state, lost: true };
    expect(bubbleShooterPlugin.isTerminal(lostState)).not.toBeNull();
    expect(bubbleShooterPlugin.hint!(lostState)).toBeNull();
  });
});
