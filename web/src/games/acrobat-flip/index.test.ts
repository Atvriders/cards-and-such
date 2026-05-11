import { describe, it, expect } from "vitest";
import { acrobatFlipPlugin, acrobatFlipSettings } from "./index.js";
import type { AcrobatFlipState } from "./state.js";

const S = { flips: acrobatFlipSettings.flips.default } as const;

describe("acrobat-flip plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(acrobatFlipPlugin.id).toBe("acrobat-flip");
    expect(acrobatFlipPlugin.title).toBe("Acrobat Flip");
    expect(acrobatFlipPlugin.category).toBe("arcade");
    expect(acrobatFlipPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof acrobatFlipPlugin.description).toBe("string");
    expect(acrobatFlipPlugin.description.length).toBeGreaterThan(0);
    expect(typeof acrobatFlipPlugin.howToPlay).toBe("string");
    expect(acrobatFlipPlugin.settings).toBeDefined();
    expect(acrobatFlipPlugin.settings.flips.kind).toBe("enum");
    expect(typeof acrobatFlipPlugin.initialState).toBe("function");
    expect(typeof acrobatFlipPlugin.reducer).toBe("function");
    expect(typeof acrobatFlipPlugin.isTerminal).toBe("function");
    expect(acrobatFlipPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = acrobatFlipPlugin.initialState(99, S);
    const b = acrobatFlipPlugin.initialState(99, S);
    expect(a).toEqual(b);
    expect(a.gameOver).toBe(false);
    expect(a.flipNum).toBe(1);
    expect(a.score).toBe(0);
    expect(a.history).toEqual([]);
    expect(a.quality).toBeNull();
    expect(a.totalFlips).toBe(parseInt(S.flips, 10));
    expect(a.angle).toBeGreaterThanOrEqual(0);
    expect(a.angle).toBeLessThan(360);
    expect(a.targetAngle).toBeGreaterThanOrEqual(0);
    expect(a.targetAngle).toBeLessThan(360);
    expect(acrobatFlipPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null once gameOver is set", () => {
    expect(typeof acrobatFlipPlugin.hint).toBe("function");
    const playing = acrobatFlipPlugin.initialState(3, S);
    const result = acrobatFlipPlugin.hint!(playing);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-acrobat-flip-action"]');
      expect(result.pulses).toBe(3);
    }

    const finished: AcrobatFlipState = { ...playing, gameOver: true };
    expect(acrobatFlipPlugin.hint!(finished)).toBeNull();
    expect(acrobatFlipPlugin.isTerminal(finished)).toEqual({ score: 0 });
  });
});
