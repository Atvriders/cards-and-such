import { describe, it, expect } from "vitest";
import { californiaSpeedPlugin } from "./index.js";
import type { CalSpeedSettings, CalSpeedState } from "./state.js";

const settings: CalSpeedSettings = { botReaction: "medium" };

describe("california-speed plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(californiaSpeedPlugin.id).toBe("california-speed");
    expect(californiaSpeedPlugin.title).toBe("California Speed");
    expect(californiaSpeedPlugin.category).toBe("cards");
    expect(californiaSpeedPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof californiaSpeedPlugin.description).toBe("string");
    expect(californiaSpeedPlugin.description.length).toBeGreaterThan(0);
    expect(californiaSpeedPlugin.settings).toBeDefined();
    expect(typeof californiaSpeedPlugin.settings).toBe("object");
    expect(typeof californiaSpeedPlugin.initialState).toBe("function");
    expect(typeof californiaSpeedPlugin.reducer).toBe("function");
    expect(typeof californiaSpeedPlugin.isTerminal).toBe("function");
    expect(californiaSpeedPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = californiaSpeedPlugin.initialState(42, settings);
    const b = californiaSpeedPlugin.initialState(42, settings);
    const idChain = (s: CalSpeedState) =>
      [
        s.playerDeck.map((c) => c.id).join("|"),
        s.botDeck.map((c) => c.id).join("|"),
        s.table.map((c) => (c ? c.id : "_")).join("|"),
      ].join(";");
    expect(idChain(a)).toBe(idChain(b));
    expect(a.phase).toBe("waiting");
    expect(a.winner).toBeNull();
    expect(a.matchSlots).toBeNull();
    expect(a.playerDeck.length).toBe(24);
    expect(a.botDeck.length).toBe(24);
    expect(a.table.filter((c) => c !== null).length).toBe(4);
    expect(californiaSpeedPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for waiting/slap-window phases and null otherwise", () => {
    expect(typeof californiaSpeedPlugin.hint).toBe("function");
    const fresh = californiaSpeedPlugin.initialState(7, settings);
    // Fresh state is "waiting" → hint should point at the flip target.
    const waitingHint = californiaSpeedPlugin.hint!(fresh);
    expect(waitingHint).not.toBeNull();
    expect(waitingHint!.selector).toBe('[data-testid="hint-target-california-speed-flip"]');
    expect(waitingHint!.pulses).toBe(3);

    // Synthetic slap-window state → hint should point at the slap target.
    const slapState: CalSpeedState = { ...fresh, phase: "slap-window", matchSlots: [0, 1] };
    const slapHint = californiaSpeedPlugin.hint!(slapState);
    expect(slapHint).not.toBeNull();
    expect(slapHint!.selector).toBe('[data-testid="hint-target-california-speed-slap"]');
    expect(slapHint!.pulses).toBe(3);

    // Done state → hint should fall through to null.
    const doneState: CalSpeedState = { ...fresh, phase: "done", winner: "player" };
    expect(californiaSpeedPlugin.hint!(doneState)).toBeNull();
    expect(californiaSpeedPlugin.isTerminal(doneState)).toEqual({ score: 100 });
  });
});
