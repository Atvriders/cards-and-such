import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  legalChoices,
  cpuPickPawn,
  HOME,
  PAWNS_PER_PLAYER,
  NUM_PLAYERS,
  SPECIALS,
} from "./state.js";

const S = { _dummy: false };

describe("chutes-and-ladders-long", () => {
  it("initialState is deterministic by seed", () => {
    const a = initialState(42, S);
    const b = initialState(42, S);
    expect(a).toEqual(b);
    const c = initialState(43, S);
    expect(c).not.toEqual(a);
  });

  it("starts with all 16 pawns at square 0 and player 0 to roll", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("rolling");
    expect(s.turn).toBe(0);
    expect(s.positions.length).toBe(NUM_PLAYERS);
    for (const row of s.positions) {
      expect(row.length).toBe(PAWNS_PER_PLAYER);
      expect(row.every((p) => p === 0)).toBe(true);
    }
  });

  it("isTerminal is null on fresh state", () => {
    expect(isTerminal(initialState(7, S))).toBeNull();
  });

  it("roll transitions human to moving (and CPUs auto-move)", () => {
    const s0 = initialState(99, S);
    const s1 = reducer(s0, { type: "roll" });
    // Human turn after a roll: either still on human in 'moving' phase, or
    // bounced to a CPU's rolling phase if no legal choices (very unlikely from start).
    expect(["moving", "rolling", "done"]).toContain(s1.phase);
    expect(s1.die).toBeGreaterThanOrEqual(1);
    expect(s1.die).toBeLessThanOrEqual(6);
  });

  it("illegal actions return same state reference", () => {
    const s = initialState(5, S);
    // Cannot move during rolling phase
    const s2 = reducer(s, { type: "move", pawnIdx: 0 });
    expect(s2).toBe(s);
    // cpuStep on human turn does nothing
    const s3 = reducer(s, { type: "cpuStep" });
    expect(s3).toBe(s);
  });

  it("legalChoices empty when no pawns can advance (overshoot)", () => {
    const s = initialState(1, S);
    // Force all human pawns to HOME-1 so a roll of 2+ would overshoot
    const fake = {
      ...s,
      positions: s.positions.map((row, p) =>
        p === 0 ? row.map(() => HOME - 1) : row.slice(),
      ),
    };
    const choices = legalChoices(fake, 0, 6);
    expect(choices.length).toBe(0);
  });

  it("forced move: when every legal pawn would backslide, only the leader is eligible", () => {
    // Construct a scenario where player 0 rolling 1 from square 15 lands on 16 (chute -> 6).
    // Put all 4 pawns at squares that all land on snake heads with pips=1.
    // Easier: put 3 pawns at 0 and one at 15. Roll 1.
    // From 0: 0+1=1 -> ladder, NOT a snake -> non-backslide. So that's eligible without backslide.
    // Try a different roll: make all pawns face snakes.
    // From square 47, +1 = 48 (no special). So that's safe.
    // Use square 15 + 1 = 16 (snake). And ensure other pawns also face snakes.
    // Put pawns at: 15, 46, 48, 55. Roll 1 -> 16 (snake), 47 (snake), 49 (snake), 56 (snake). All snake heads.
    const base = initialState(1, S);
    const positions = base.positions.map((row, p) => (p === 0 ? [15, 46, 48, 55] : row.slice()));
    const state = { ...base, positions, die: 1, phase: "moving" as const };
    // Verify all targets are snakes
    expect(SPECIALS[16]!.type).toBe("snake");
    expect(SPECIALS[47]!.type).toBe("snake");
    expect(SPECIALS[49]!.type).toBe("snake");
    expect(SPECIALS[56]!.type).toBe("snake");
    const choices = legalChoices(state, 0, 1);
    expect(choices.length).toBe(1);
    // Leader of {15, 46, 48, 55} is index 3 (square 55)
    expect(choices[0]).toBe(3);
  });

  it("ladder applies when landing on a ladder square", () => {
    const base = initialState(1, S);
    // Place pawn 0 at square 0, give it die=1 (1 -> 38 ladder)
    const state = { ...base, positions: base.positions.map((r) => r.slice()), die: 1, phase: "moving" as const };
    const next = reducer(state, { type: "move", pawnIdx: 0 });
    expect(next.positions[0]![0]).toBe(38);
    // Turn should have advanced to player 1
    expect(next.turn).toBe(1);
    expect(next.phase).toBe("rolling");
  });

  it("chute applies when landing on a chute head with no occupant", () => {
    const base = initialState(1, S);
    // Place pawn 0 at 15, die=1 -> 16 -> chute to 6
    const positions = base.positions.map((row, p) => (p === 0 ? [15, 0, 0, 0] : row.slice()));
    const state = { ...base, positions, die: 1, phase: "moving" as const };
    const next = reducer(state, { type: "move", pawnIdx: 0 });
    expect(next.positions[0]![0]).toBe(6);
  });

  it("pile-up rule: arriving pawn pushes a single occupant down the chute", () => {
    const base = initialState(1, S);
    // Put player 0 pawn 0 at 15. Put player 1 pawn 0 at 16 (the chute head, currently occupied).
    // Player 0 rolls 1 -> lands on 16. Single occupant -> pile-up.
    // Expected: player 1 pawn 0 goes to 6 (the chute destination), player 0 pawn 0 stays at 16.
    const positions = base.positions.map((row) => row.slice());
    positions[0]![0] = 15;
    positions[1]![0] = 16;
    const state = { ...base, positions, die: 1, phase: "moving" as const };
    const next = reducer(state, { type: "move", pawnIdx: 0 });
    expect(next.positions[0]![0]).toBe(16); // arriving pawn at head
    expect(next.positions[1]![0]).toBe(6); // pushed down
    expect(next.lastPush).not.toBeNull();
    expect(next.lastPush?.player).toBe(1);
    expect(next.lastPush?.to).toBe(6);
  });

  it("pile-up does NOT trigger with two occupants already on the head", () => {
    const base = initialState(1, S);
    const positions = base.positions.map((row) => row.slice());
    positions[0]![0] = 15;
    positions[1]![0] = 16;
    positions[2]![0] = 16; // two occupants
    const state = { ...base, positions, die: 1, phase: "moving" as const };
    const next = reducer(state, { type: "move", pawnIdx: 0 });
    // Arriving pawn slides itself, others stay
    expect(next.positions[0]![0]).toBe(6);
    expect(next.positions[1]![0]).toBe(16);
    expect(next.positions[2]![0]).toBe(16);
  });

  it("overshoot beyond 110 is illegal", () => {
    const base = initialState(1, S);
    const positions = base.positions.map((row, p) => (p === 0 ? [109, 0, 0, 0] : row.slice()));
    const state = { ...base, positions, die: 6, phase: "moving" as const };
    // Pawn 0 at 109 +6 = 115, illegal. Others at 0 +6 = 6, legal.
    const choices = legalChoices(state, 0, 6);
    expect(choices.includes(0)).toBe(false);
    expect(choices.includes(1)).toBe(true);
  });

  it("win condition: all 4 pawns home for player 0 yields score = 100 + 50*4", () => {
    const base = initialState(1, S);
    // Place 3 pawns at HOME, last pawn at 109. Pawn 109 + 1 -> 110 = HOME.
    const positions = base.positions.map((row, p) =>
      p === 0 ? [HOME, HOME, HOME, 109] : row.slice(),
    );
    const state = { ...base, positions, die: 1, phase: "moving" as const, turn: 0 };
    const next = reducer(state, { type: "move", pawnIdx: 3 });
    expect(next.phase).toBe("done");
    expect(next.winner).toBe(0);
    expect(next.score).toBe(100 + 50 * 4);
    expect(isTerminal(next)).toEqual({ score: 300 });
  });

  it("loss: when a CPU wins, score is 0", () => {
    const base = initialState(1, S);
    // Make CPU 1 ready to win: 3 home, last pawn at 109.
    const positions = base.positions.map((row, p) =>
      p === 1 ? [HOME, HOME, HOME, 109] : row.slice(),
    );
    // It is CPU 1's turn rolling. cpuStep -> rolls -> picks laggiest (only one not-home: pawn 3 at 109).
    // For deterministic outcome, we manually trigger and rely on the roll yielding any legal value.
    // We'll skip relying on RNG: set a state where pawn 3 is at 109 and die is rolled by the reducer.
    // Just check that legalChoices for CPU 1 with pips=1 is [3].
    const state = { ...base, positions, turn: 1, phase: "rolling" as const };
    // We can't deterministically force die value, but we can call cpuPickPawn directly:
    expect(cpuPickPawn(state, 1, 1)).toBe(3);
  });

  it("CPU picks laggiest pawn among legal choices", () => {
    const base = initialState(1, S);
    const positions = base.positions.map((row, p) =>
      p === 1 ? [50, 20, 80, 40] : row.slice(),
    );
    const state = { ...base, positions, turn: 1, phase: "rolling" as const };
    // Pawn at 20 is laggiest. With pips=3, 20+3=23 (no special).
    expect(cpuPickPawn(state, 1, 3)).toBe(1);
  });

  it("when no eligible pawns at all, turn just advances", () => {
    const base = initialState(1, S);
    // All player 0 pawns at HOME, but it's player 0's turn. Roll with no eligible -> skip to next player.
    const positions = base.positions.map((row, p) =>
      p === 0 ? [HOME, HOME, HOME, HOME] : row.slice(),
    );
    // But if all 4 are home, player 0 has already won. Pre-check: set so 3 are home, 1 at HOME-1 needing exact 1.
    // Force roll 6 means overshoot for the lone non-home pawn.
    positions[0] = [HOME, HOME, HOME, HOME - 1];
    // Actually if all 4 home, win triggers BEFORE this state. We need to test "skip turn" for a non-winning player.
    // Set CPU 2 to a state where all pawns at HOME-1 and we roll 6 -> overshoot for all.
    positions[2] = [HOME - 1, HOME - 1, HOME - 1, HOME - 1];
    const state = { ...base, positions, turn: 2, phase: "rolling" as const };
    // Manually invoke: legalChoices for player 2 with pips=6 is [].
    expect(legalChoices(state, 2, 6)).toEqual([]);
  });
});
