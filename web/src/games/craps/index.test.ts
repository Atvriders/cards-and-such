import { describe, it, expect } from "vitest";
import { crapsPlugin } from "./index.js";
import type { CrapsSettings } from "./state.js";

const S: CrapsSettings = { rounds: "10", betSize: "25" };

describe("crapsPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(crapsPlugin.id).toBe("craps");
    expect(crapsPlugin.title).toBe("Craps");
    expect(crapsPlugin.category).toBe("dice");
    expect(crapsPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof crapsPlugin.description).toBe("string");
    expect(crapsPlugin.description.length).toBeGreaterThan(0);
    expect(crapsPlugin.settings).toBeDefined();
    expect(crapsPlugin.settings.rounds.kind).toBe("enum");
    expect(crapsPlugin.settings.rounds.default).toBe("10");
    expect(crapsPlugin.settings.rounds.options).toEqual(["5", "10", "20"]);
    expect(crapsPlugin.settings.betSize.kind).toBe("enum");
    expect(crapsPlugin.settings.betSize.default).toBe("25");
    expect(crapsPlugin.settings.betSize.options).toEqual(["10", "25", "100"]);
    expect(typeof crapsPlugin.initialState).toBe("function");
    expect(typeof crapsPlugin.reducer).toBe("function");
    expect(typeof crapsPlugin.isTerminal).toBe("function");
    expect(typeof crapsPlugin.hint).toBe("function");
    expect(crapsPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = crapsPlugin.initialState(42, S);
    const b = crapsPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.settings).toEqual(S);
    expect(a.rngSeed).toBe(42);
    expect(a.bankroll).toBe(1000);
    expect(a.roundsPlayed).toBe(0);
    expect(a.phase).toBe("come-out");
    expect(a.point).toBeNull();
    expect(a.lastRoll).toBeNull();
    expect(a.lastResult).toBe("");
    expect(crapsPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget when active and null when game is over", () => {
    const fresh = crapsPlugin.initialState(7, S);
    const target = crapsPlugin.hint!(fresh);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-craps-action"]');
    expect(target!.pulses).toBe(3);

    // Force a terminal-style flag — hint should return null.
    const overByPhase = { ...fresh, phase: "gameover" as unknown as typeof fresh.phase };
    expect(crapsPlugin.hint!(overByPhase)).toBeNull();

    const overByFlag = { ...fresh, gameOver: true } as unknown as typeof fresh;
    expect(crapsPlugin.hint!(overByFlag)).toBeNull();
  });
});
