import { describe, expect, it } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  effectiveParams,
  ALL_AILMENTS,
  DOCTOR_DECK,
  TOTAL_AILMENTS,
  MAX_BUZZERS,
} from "./state.js";

const normal = { difficulty: "normal" as const };
const easy = { difficulty: "easy" as const };
const hard = { difficulty: "hard" as const };

describe("Operation (Full Specialist) - state", () => {
  it("has 12 distinct ailments covering all 12 classics", () => {
    expect(ALL_AILMENTS).toHaveLength(TOTAL_AILMENTS);
    const ids = new Set(ALL_AILMENTS.map((a) => a.id));
    expect(ids.size).toBe(TOTAL_AILMENTS);
    // a few canonical names must be present
    const names = ALL_AILMENTS.map((a) => a.name);
    expect(names).toContain("Adam's Apple");
    expect(names).toContain("Bread Basket");
    expect(names).toContain("Wish Bone");
    expect(names).toContain("Funny Bone");
    expect(names).toContain("Butterflies in Stomach");
    expect(names).toContain("Charley Horse");
    expect(names).toContain("Wrenched Ankle");
    expect(names).toContain("Spare Ribs");
    expect(names).toContain("Broken Heart");
    expect(names).toContain("Brain Freeze");
    expect(names).toContain("Writer's Cramp");
    expect(names).toContain("Water on the Knee");
  });

  it("initialState is deterministic for the same seed", () => {
    const a = initialState(1234, normal);
    const b = initialState(1234, normal);
    expect(a.remaining.map((x) => x.id)).toEqual(b.remaining.map((x) => x.id));
    expect(a.current?.id).toBe(b.current?.id);
    expect(a.rngSeed).toBe(b.rngSeed);
  });

  it("isTerminal is null on a fresh state", () => {
    const s = initialState(7, normal);
    expect(isTerminal(s)).toBeNull();
    expect(s.phase).toBe("ready");
    expect(s.score).toBe(0);
    expect(s.buzzers).toBe(0);
  });

  it("difficulty multiplier changes tolerance via effectiveParams", () => {
    const sN = initialState(99, normal);
    const sE = initialState(99, easy);
    const sH = initialState(99, hard);
    const pN = effectiveParams(sN)!;
    const pE = effectiveParams(sE)!;
    const pH = effectiveParams(sH)!;
    expect(pE.tolerance).toBeGreaterThan(pN.tolerance);
    expect(pH.tolerance).toBeLessThan(pN.tolerance);
  });

  it("draw transitions to active when no doctor card lands, or drawing when one does", () => {
    const s = initialState(1, normal);
    const after = reducer(s, { type: "draw" });
    expect(["active", "drawing"]).toContain(after.phase);
    if (after.phase === "drawing") expect(after.activeDoctor).not.toBeNull();
    if (after.phase === "active") expect(after.activeDoctor).toBeNull();
  });

  it("resolve(success) awards the current ailment's fee and advances", () => {
    let s = initialState(42, normal);
    const cur = s.current!;
    s = reducer(s, { type: "draw" });
    if (s.phase === "drawing") s = reducer(s, { type: "start" });
    // (if draw landed us in active directly, phase is already active)
    expect(s.phase).toBe("active");
    const before = s.score;
    s = reducer(s, { type: "resolve", outcome: "success" });
    // score increases by at least the fee (doctor card might add bonus)
    expect(s.score).toBeGreaterThanOrEqual(before + cur.fee);
    expect(s.extracted).toBe(1);
    expect(s.lastOutcome).toBe("success");
    expect(s.phase === "result" || s.phase === "done").toBe(true);
  });

  it("3 buzzer failures end the game with phase=done", () => {
    let s = initialState(5, normal);
    for (let i = 0; i < MAX_BUZZERS; i++) {
      s = reducer(s, { type: "draw" });
      if (s.phase === "drawing") s = reducer(s, { type: "start" });
      s = reducer(s, { type: "resolve", outcome: "buzz" });
      if (s.phase === "result") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
    expect(s.buzzers).toBe(MAX_BUZZERS);
  });

  it("extracting all 12 ailments ends the game", () => {
    let s = initialState(11, normal);
    for (let i = 0; i < TOTAL_AILMENTS; i++) {
      s = reducer(s, { type: "draw" });
      if (s.phase === "drawing") s = reducer(s, { type: "start" });
      s = reducer(s, { type: "resolve", outcome: "success" });
      if (s.phase === "result") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
    expect(s.extracted).toBe(TOTAL_AILMENTS);
    expect(isTerminal(s)?.score).toBe(s.score);
  });

  it("illegal actions return the same state reference", () => {
    const s = initialState(2, normal);
    // resolve while ready (not active) is illegal
    expect(reducer(s, { type: "resolve", outcome: "success" })).toBe(s);
    // next while ready (not result) is illegal
    expect(reducer(s, { type: "next" })).toBe(s);
    // start while ready without draw is allowed (drawing phase optional), but
    // start without a current ailment isn't possible since current exists.
    // unknown action returns same state
    expect(reducer(s, { type: "bogus" } as unknown as { type: "draw" })).toBe(s);
  });

  it("once done, the reducer is a no-op", () => {
    let s = initialState(8, normal);
    for (let i = 0; i < MAX_BUZZERS; i++) {
      s = reducer(s, { type: "draw" });
      if (s.phase === "drawing") s = reducer(s, { type: "start" });
      s = reducer(s, { type: "resolve", outcome: "buzz" });
      if (s.phase === "result") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
    const sameAfter = reducer(s, { type: "draw" });
    expect(sameAfter).toBe(s);
  });

  it("doctor deck exposes all expected effects", () => {
    const effects = new Set(DOCTOR_DECK.map((c) => c.effect));
    expect(effects.has("free-bonus")).toBe(true);
    expect(effects.has("double-fee")).toBe(true);
    expect(effects.has("steady-hand")).toBe(true);
    expect(effects.has("rush-job")).toBe(true);
    expect(effects.has("no-buzzer")).toBe(true);
    expect(effects.has("second-opinion")).toBe(true);
  });

  it("'second-opinion' doctor card keeps a missed ailment in play", () => {
    // We need to force a state with activeDoctor=second-opinion in active phase.
    const base = initialState(42, normal);
    const firstAilment = base.current!;
    const cardSecondOpinion = DOCTOR_DECK.find((c) => c.effect === "second-opinion")!;
    const forced = { ...base, phase: "active" as const, activeDoctor: cardSecondOpinion };
    const after = reducer(forced, { type: "resolve", outcome: "miss" });
    // Missed ailment should still be in remaining (cycled to back).
    const stillIn = after.remaining.some((a) => a.id === firstAilment.id);
    expect(stillIn).toBe(true);
  });

  it("'no-buzzer' doctor card downgrades a buzz to a miss", () => {
    const base = initialState(42, normal);
    const noBuzzer = DOCTOR_DECK.find((c) => c.effect === "no-buzzer")!;
    const forced = { ...base, phase: "active" as const, activeDoctor: noBuzzer };
    const after = reducer(forced, { type: "resolve", outcome: "buzz" });
    expect(after.buzzers).toBe(0); // a buzz didn't count
    expect(after.lastOutcome).toBe("miss");
  });

  it("'double-fee' doctor card doubles the success reward", () => {
    const base = initialState(42, normal);
    const cur = base.current!;
    const doubleCard = DOCTOR_DECK.find((c) => c.effect === "double-fee")!;
    const forced = { ...base, phase: "active" as const, activeDoctor: doubleCard };
    const after = reducer(forced, { type: "resolve", outcome: "success" });
    expect(after.score).toBe(cur.fee * 2);
  });
});
