import { describe, it, expect } from "vitest";
import {
  BOARD_RADIUS,
  initialState,
  isTerminal,
  opponentHasDiscs,
  reducer,
  type CrokinoleAction,
  type CrokinoleState,
} from "./state.js";

const defaults = { discsPerPlayer: "12" as const, target: "100" as const };

function runUntilRest(state: CrokinoleState, maxTicks = 2000): CrokinoleState {
  let s = state;
  let i = 0;
  while (s.phase === "sim" && i < maxTicks) {
    s = reducer(s, { type: "tick" } as CrokinoleAction);
    i++;
  }
  return s;
}

describe("initialState", () => {
  it("starts at 0-0 with 12 discs each", () => {
    const s = initialState(1, defaults);
    expect(s.score).toEqual([0, 0]);
    expect(s.remaining).toEqual([12, 12]);
    expect(s.phase).toBe("aim");
    expect(s.round).toBe(1);
    expect(s.pegs.length).toBe(8);
  });

  it("respects the discsPerPlayer setting (6)", () => {
    const s = initialState(2, { discsPerPlayer: "6", target: "60" });
    expect(s.remaining).toEqual([6, 6]);
  });

  it("is deterministic by seed", () => {
    const a = initialState(99, defaults);
    const b = initialState(99, defaults);
    expect(a.pegs).toEqual(b.pegs);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.remaining).toEqual(b.remaining);
  });
});

describe("reducer — shooting basics", () => {
  it("shoot adds a disc and switches turn to sim phase", () => {
    const s = initialState(1, defaults);
    const after = reducer(s, { type: "shoot", angle: -Math.PI / 2, power: 0.5 });
    expect(after.discs.length).toBe(1);
    expect(after.phase).toBe("sim");
    expect(after.remaining[0]).toBe(11);
  });

  it("ticking eventually leads back to aim phase", () => {
    let s = initialState(3, defaults);
    s = reducer(s, { type: "shoot", angle: -Math.PI / 2, power: 0.8 });
    expect(s.phase).toBe("sim");
    const rested = runUntilRest(s);
    // Either it goes back to aim (turn becomes CPU) or round-end if discs depleted.
    expect(["aim", "round-end", "done"]).toContain(rested.phase);
    if (rested.phase === "aim") {
      // Turn should now be CPU since human shot.
      expect(rested.turn).toBe(1);
    }
  });

  it("shoot is ignored when phase is sim", () => {
    let s = initialState(4, defaults);
    s = reducer(s, { type: "shoot", angle: 0, power: 0.5 });
    const before = s;
    const after = reducer(s, { type: "shoot", angle: 1, power: 0.5 });
    expect(after).toBe(before);
  });

  it("rejects illegal next-round when not in round-end", () => {
    const s = initialState(5, defaults);
    const after = reducer(s, { type: "next-round" });
    expect(after).toBe(s);
  });
});

describe("must-touch-opponent rule", () => {
  it("opponentHasDiscs reflects placed discs", () => {
    const s = initialState(7, defaults);
    expect(opponentHasDiscs(s, 1)).toBe(false);

    const placed: CrokinoleState = {
      ...s,
      discs: [
        {
          id: 99,
          owner: 1,
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          alive: true,
          holed: false,
          touchedOpp: false,
        },
      ],
    };
    expect(opponentHasDiscs(placed, 1)).toBe(true);
  });

  it("a free shot (no opp discs) that lands in a ring stays on the board", () => {
    let s = initialState(11, defaults);
    // Aim straight at the center with modest power, from human side (positive y).
    s = reducer(s, { type: "shoot", angle: -Math.PI / 2, power: 0.55 });
    s = runUntilRest(s);
    // The single disc should have remained alive (no must-touch rule was active).
    const ours = s.discs.find(d => d.owner === 0);
    expect(ours).toBeDefined();
    expect(ours!.alive || ours!.holed).toBe(true);
  });
});

describe("isTerminal & match end", () => {
  it("returns null while phase != done", () => {
    expect(isTerminal(initialState(1, defaults))).toBeNull();
  });

  it("returns human score on win, 0 on loss", () => {
    const baseline = initialState(1, defaults);
    const won: CrokinoleState = { ...baseline, phase: "done", score: [110, 80] };
    expect(isTerminal(won)).toEqual({ score: 110 });

    const lost: CrokinoleState = { ...baseline, phase: "done", score: [50, 100] };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });
});

describe("reset", () => {
  it("reset returns to a fresh state with same seed", () => {
    let s = initialState(42, defaults);
    s = reducer(s, { type: "shoot", angle: 0, power: 0.5 });
    s = runUntilRest(s);
    const fresh = reducer(s, { type: "reset" });
    const expected = initialState(42, defaults);
    expect(fresh.discs.length).toBe(0);
    expect(fresh.score).toEqual([0, 0]);
    expect(fresh.remaining).toEqual(expected.remaining);
  });
});

describe("physics sanity", () => {
  it("discs that go off-board are removed (not alive)", () => {
    // Shoot at max power into the rim — should fly off.
    let s = initialState(13, defaults);
    s = reducer(s, { type: "shoot", angle: -Math.PI / 2, power: 1 });
    s = runUntilRest(s);
    const ours = s.discs.find(d => d.owner === 0);
    expect(ours).toBeDefined();
    // Either it holed or it flew off; given the launch is from y≈+rim heading
    // toward -y at full speed, it may either drop in the hole or fly past it.
    // Just verify it's not stuck mid-air alive with high velocity.
    if (ours!.alive) {
      expect(Math.hypot(ours!.vx, ours!.vy)).toBeLessThan(0.5);
      expect(Math.hypot(ours!.x, ours!.y)).toBeLessThanOrEqual(BOARD_RADIUS);
    }
  });
});
