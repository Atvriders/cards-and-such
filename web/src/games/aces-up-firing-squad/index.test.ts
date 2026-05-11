import { describe, it, expect } from "vitest";
import { acesUpFiringSquadPlugin } from "./index.js";
import type { AcesUpFiringSquadState, AcesUpFiringSquadSettings } from "./state.js";

const SETTINGS = {} as AcesUpFiringSquadSettings;

describe("acesUpFiringSquadPlugin", () => {
  it("exposes the required GamePlugin shape", () => {
    expect(acesUpFiringSquadPlugin.id).toBe("aces-up-firing-squad");
    expect(acesUpFiringSquadPlugin.title).toBe("Aces Up (Firing Squad)");
    expect(acesUpFiringSquadPlugin.category).toBe("solitaire");
    expect(acesUpFiringSquadPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof acesUpFiringSquadPlugin.description).toBe("string");
    expect(acesUpFiringSquadPlugin.description.length).toBeGreaterThan(0);
    expect(typeof acesUpFiringSquadPlugin.howToPlay).toBe("string");
    expect(acesUpFiringSquadPlugin.settings).toBeDefined();
    expect(typeof acesUpFiringSquadPlugin.initialState).toBe("function");
    expect(typeof acesUpFiringSquadPlugin.reducer).toBe("function");
    expect(typeof acesUpFiringSquadPlugin.isTerminal).toBe("function");
    expect(typeof acesUpFiringSquadPlugin.hint).toBe("function");
    expect(acesUpFiringSquadPlugin.component).toBeDefined();
  });

  it("initialState is deterministic for a seed and isTerminal returns null at start", () => {
    const seed = 4242;
    const a = acesUpFiringSquadPlugin.initialState(seed, SETTINGS);
    const b = acesUpFiringSquadPlugin.initialState(seed, SETTINGS);
    // Deterministic: same seed produces identical card layout
    const flatA = a.columns.flat().map((c) => c.id).concat(a.stock.map((c) => c.id));
    const flatB = b.columns.flat().map((c) => c.id).concat(b.stock.map((c) => c.id));
    expect(flatA).toEqual(flatB);
    // Sanity: 4 columns of 1 card each, 48 in stock, not won
    expect(a.columns).toHaveLength(4);
    for (const col of a.columns) expect(col).toHaveLength(1);
    expect(a.stock).toHaveLength(48);
    expect(a.won).toBe(false);
    expect(a.score).toBe(0);
    expect(a.movesMade).toBe(0);
    // isTerminal must be null because stock is non-empty / not won
    expect(acesUpFiringSquadPlugin.isTerminal!(a)).toBeNull();
  });

  it("hint returns a valid HintTarget for fresh state and null when won", () => {
    const fresh = acesUpFiringSquadPlugin.initialState(7, SETTINGS);
    const target = acesUpFiringSquadPlugin.hint!(fresh);
    expect(target).not.toBeNull();
    expect(typeof target!.selector).toBe("string");
    expect(target!.selector.length).toBeGreaterThan(0);
    expect(target!.pulses).toBe(3);
    // Must match one of the two branches in the source: a column-discard target
    // or the deal target. Both use the aces-up-firing-squad testid prefix.
    expect(target!.selector.startsWith('[data-testid="hint-target-aces-up-firing-squad-')).toBe(true);

    // Won state short-circuits to null
    const wonState: AcesUpFiringSquadState = {
      ...fresh,
      won: true,
    };
    expect(acesUpFiringSquadPlugin.hint!(wonState)).toBeNull();

    // Empty board with empty stock — no tops, no stock — hint is null
    const emptyState: AcesUpFiringSquadState = {
      columns: [[], [], [], []],
      stock: [],
      movesMade: 0,
      score: 0,
      won: false,
    };
    expect(acesUpFiringSquadPlugin.hint!(emptyState)).toBeNull();
  });
});
