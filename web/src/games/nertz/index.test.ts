import { describe, it, expect } from "vitest";
import { nertzPlugin, nertzSettings } from "./index.js";

const settings = { botSpeed: "medium" as const };

describe("nertz plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(nertzPlugin.id).toBe("nertz");
    expect(nertzPlugin.title).toBe("Nertz");
    expect(nertzPlugin.category).toBe("cards");
    expect(nertzPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof nertzPlugin.description).toBe("string");
    expect(nertzPlugin.description.length).toBeGreaterThan(0);
    expect(nertzPlugin.settings).toBe(nertzSettings);
    expect(nertzPlugin.settings.botSpeed.kind).toBe("enum");
    expect(nertzPlugin.settings.botSpeed.default).toBe("medium");
    expect(nertzPlugin.settings.botSpeed.options).toEqual(["slow", "medium", "fast"]);
    expect(typeof nertzPlugin.initialState).toBe("function");
    expect(typeof nertzPlugin.reducer).toBe("function");
    expect(typeof nertzPlugin.isTerminal).toBe("function");
    expect(nertzPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = nertzPlugin.initialState(42, settings);
    const b = nertzPlugin.initialState(42, settings);
    const aIds = a.playerNertzPile.map(c => c.id).join("|");
    const bIds = b.playerNertzPile.map(c => c.id).join("|");
    expect(aIds).toBe(bIds);
    expect(a.phase).toBe("playing");
    expect(a.winner).toBeNull();
    expect(nertzPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns null when game is over, otherwise a HintTarget", () => {
    expect(typeof nertzPlugin.hint).toBe("function");
    const fresh = nertzPlugin.initialState(7, settings);
    const result = nertzPlugin.hint!(fresh);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toContain("hint-target-nertz-action");
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    const doneState = { ...fresh, phase: "done" as const, winner: "player" as const };
    expect(nertzPlugin.hint!(doneState)).toBeNull();
  });
});
