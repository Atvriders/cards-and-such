import { describe, it, expect } from "vitest";
import { concentrationSpeedPlugin } from "./index.js";
import { TOTAL_ROUNDS } from "./state.js";

describe("concentrationSpeedPlugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(concentrationSpeedPlugin.id).toBe("concentration-speed");
    expect(concentrationSpeedPlugin.title).toBe("Concentration Speed");
    expect(concentrationSpeedPlugin.category).toBe("board");
    expect(concentrationSpeedPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof concentrationSpeedPlugin.initialState).toBe("function");
    expect(typeof concentrationSpeedPlugin.reducer).toBe("function");
    expect(typeof concentrationSpeedPlugin.isTerminal).toBe("function");
    expect(typeof concentrationSpeedPlugin.hint).toBe("function");
  });

  it("produces a deterministic initialState with no terminal result", () => {
    const settings = { dummy: false };
    const a = concentrationSpeedPlugin.initialState(42, settings);
    const b = concentrationSpeedPlugin.initialState(42, settings);
    expect(a).toEqual(b);
    expect(a.rounds).toHaveLength(TOTAL_ROUNDS);
    expect(a.currentIndex).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("playing");
    expect(concentrationSpeedPlugin.isTerminal!(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null otherwise", () => {
    const settings = { dummy: false };
    const playingState = concentrationSpeedPlugin.initialState(1, settings);
    const target = concentrationSpeedPlugin.hint!(playingState);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-concentration-speed-answer-0"]');
    expect(target!.pulses).toBe(3);

    const doneState = { ...playingState, phase: "done" as const };
    expect(concentrationSpeedPlugin.hint!(doneState)).toBeNull();
  });
});
