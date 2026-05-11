import { describe, it, expect } from "vitest";
import { centuryGolemEditionPlugin } from "./index.js";

describe("centuryGolemEditionPlugin", () => {
  it("has the expected plugin shape", () => {
    expect(centuryGolemEditionPlugin.id).toBe("century-golem-edition");
    expect(centuryGolemEditionPlugin.title).toBe("Century Golem Edition");
    expect(centuryGolemEditionPlugin.category).toBe("board");
    expect(centuryGolemEditionPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof centuryGolemEditionPlugin.initialState).toBe("function");
    expect(typeof centuryGolemEditionPlugin.reducer).toBe("function");
    expect(typeof centuryGolemEditionPlugin.isTerminal).toBe("function");
    expect(typeof centuryGolemEditionPlugin.hint).toBe("function");
    expect(centuryGolemEditionPlugin.component).toBeDefined();
  });

  it("initialState is deterministic and isTerminal is null at start", () => {
    const s1 = centuryGolemEditionPlugin.initialState(12345, { dummy: false });
    const s2 = centuryGolemEditionPlugin.initialState(12345, { dummy: false });
    expect(s1).toEqual(s2);
    expect(s1.turn).toBe(1);
    expect(s1.cash).toBe(200);
    expect(s1.assets).toBe(0);
    expect(s1.workers).toBe(0);
    expect(s1.phase).toBe("choosing");
    expect(centuryGolemEditionPlugin.isTerminal!(s1)).toBeNull();
  });

  it("hint returns a HintTarget while choosing and null otherwise", () => {
    const choosing = centuryGolemEditionPlugin.initialState(1, { dummy: false });
    const hint = centuryGolemEditionPlugin.hint!(choosing);
    expect(hint).not.toBeNull();
    expect(hint!.selector).toBe('[data-testid="hint-target-century-golem-edition-primary"]');
    expect(hint!.pulses).toBe(3);

    const resolved = { ...choosing, phase: "resolved" as const };
    expect(centuryGolemEditionPlugin.hint!(resolved)).toBeNull();

    const done = { ...choosing, phase: "done" as const };
    expect(centuryGolemEditionPlugin.hint!(done)).toBeNull();
  });
});
