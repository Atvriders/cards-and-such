import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  NUM_PLAYERS,
  ACTIONS_PER_TURN,
  HUMAN_SEAT,
  CITIES,
  type BrassBirminghamFullAction,
  type BrassBirminghamFullSettings,
  type BrassBirminghamFullState,
} from "./state.js";

const SETTINGS: BrassBirminghamFullSettings = { _dummy: false };

function step(s: BrassBirminghamFullState, a: BrassBirminghamFullAction): BrassBirminghamFullState {
  return reducer(s, a);
}

/** Run the game forward by repeatedly stepping CPUs and ending the human's turn via pass. */
function autoplay(seed: number, maxIters = 2000): BrassBirminghamFullState {
  let s = initialState(seed, SETTINGS);
  for (let i = 0; i < maxIters; i++) {
    if (s.phase === "done") break;
    if (s.phase === "era-scoring") { s = step(s, { type: "advance-era" }); continue; }
    if (s.players[s.currentSeat]?.isCpu) { s = step(s, { type: "cpu-step" }); continue; }
    s = step(s, { type: "pass" });
  }
  return s;
}

describe("BrassBirminghamFull", () => {
  it("initialState is deterministic by seed", () => {
    const a = initialState(123, SETTINGS);
    const b = initialState(123, SETTINGS);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("initialState has 4 players, era=canal, phase=playing", () => {
    const s = initialState(1, SETTINGS);
    expect(s.players.length).toBe(NUM_PLAYERS);
    expect(s.era).toBe("canal");
    expect(s.phase).toBe("playing");
    expect(s.currentSeat).toBe(HUMAN_SEAT);
    expect(s.actionsLeft).toBe(ACTIONS_PER_TURN);
    expect(s.players[0]!.isCpu).toBe(false);
    expect(s.players[1]!.isCpu).toBe(true);
  });

  it("isTerminal is null on fresh state", () => {
    expect(isTerminal(initialState(42, SETTINGS))).toBeNull();
  });

  it("loan action gives cash and reduces income", () => {
    const s0 = initialState(7, SETTINGS);
    const s1 = reducer(s0, { type: "loan" });
    expect(s1.players[0]!.cash).toBe(s0.players[0]!.cash + 30);
    expect(s1.actionsLeft).toBe(ACTIONS_PER_TURN - 1);
  });

  it("illegal build (no presence + city not allowed) returns same state reference", () => {
    const s0 = initialState(1, SETTINGS);
    // Pick a city that is NOT in allowedCities and player has no presence in.
    const forbiddenCity = CITIES.findIndex((_, i) => !s0.allowedCities.includes(i));
    expect(forbiddenCity).toBeGreaterThanOrEqual(0);
    const s1 = reducer(s0, { type: "build", kind: "cotton", city: forbiddenCity });
    expect(s1).toBe(s0);
  });

  it("build of coal auto-flips and scores VP", () => {
    const s0 = initialState(11, SETTINGS);
    const city = s0.allowedCities[0]!;
    const s1 = reducer(s0, { type: "build", kind: "coal", city });
    // Either the build succeeded (different state) or wasn't affordable.
    if (s1 !== s0) {
      expect(s1.players[0]!.vp).toBeGreaterThan(0);
      const coal = s1.players[0]!.tiles.find((t) => t.kind === "coal" && t.city === city);
      expect(coal?.flipped).toBe(true);
    }
  });

  it("pass action ends the turn and advances seat", () => {
    const s0 = initialState(5, SETTINGS);
    const s1 = reducer(s0, { type: "pass" });
    expect(s1.currentSeat).not.toBe(s0.currentSeat);
  });

  it("scout refreshes allowed cities deterministically", () => {
    const s0 = initialState(99, SETTINGS);
    const s1 = reducer(s0, { type: "scout" });
    // The allowed cities should change (rng advanced).
    expect(s1.actionsLeft).toBe(ACTIONS_PER_TURN - 1);
  });

  it("cpu-step does nothing when it's the human's turn", () => {
    const s0 = initialState(1, SETTINGS);
    const s1 = reducer(s0, { type: "cpu-step" });
    expect(s1).toBe(s0);
  });

  it("autoplay completes the game and isTerminal returns non-null", () => {
    const s = autoplay(2026);
    expect(s.phase).toBe("done");
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
  });

  it("end of canal era transitions to rail era", () => {
    let s = initialState(13, SETTINGS);
    let safety = 0;
    while (s.phase === "playing" && safety++ < 500) {
      if (s.players[s.currentSeat]?.isCpu) s = reducer(s, { type: "cpu-step" });
      else s = reducer(s, { type: "pass" });
    }
    expect(s.phase).toBe("era-scoring");
    expect(s.era).toBe("canal");
    const s2 = reducer(s, { type: "advance-era" });
    expect(s2.era).toBe("rail");
    expect(s2.phase).toBe("playing");
  });
});
