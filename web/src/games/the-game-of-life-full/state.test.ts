import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  finalScore,
  BOARD,
  CAREER_CARDS,
  COLLEGE_CAREER_CARDS,
  type LifeFullState,
  type LifeFullAction,
} from "./state.js";

const S = { startingCash: 10 };

function play(s: LifeFullState, a: LifeFullAction): LifeFullState {
  return reducer(s, a);
}

// Drive the game to completion using cpu-step semantics for CPU and a fixed
// human strategy. Returns final state.
function runToEnd(seed: number, maxSteps = 5000): LifeFullState {
  let s = initialState(seed, S);
  // Human chooses career
  s = play(s, { type: "choose-path", path: "career" });
  // Human pick career card 0
  s = play(s, { type: "pick-career", index: 0 });

  for (let i = 0; i < maxSteps; i++) {
    if (s.phase === "done") return s;
    if (s.active === "cpu") {
      s = play(s, { type: "cpu-step" });
      continue;
    }
    // Human decisions: greedy mirror
    switch (s.phase) {
      case "spinning":
        s = play(s, { type: "spin" });
        break;
      case "resolved":
        s = play(s, { type: "next" });
        break;
      case "decision-marry":
        s = play(s, { type: "marry-spin" });
        break;
      case "decision-house":
        s = play(s, { type: "buy-house", buy: true });
        break;
      case "decision-sell":
        s = play(s, { type: "sell-house", sell: true });
        break;
      case "decision-insurance":
        s = play(s, { type: "buy-insurance", buy: true });
        break;
      case "decision-spin-win":
        s = play(s, { type: "play-spin-to-win", play: true });
        break;
      case "decision-retire":
        s = play(s, { type: "pick-retirement", choice: "countryside-acres" });
        break;
      default:
        return s;
    }
  }
  return s;
}

describe("the-game-of-life-full", () => {
  it("initialState is deterministic by seed", () => {
    const a = initialState(123, S);
    const b = initialState(123, S);
    expect(a).toEqual(b);
  });

  it("initialState respects startingCash", () => {
    const s = initialState(1, { startingCash: 50 });
    expect(s.human.cash).toBe(50);
    expect(s.cpu.cash).toBe(50);
    expect(s.phase).toBe("choose-path");
  });

  it("isTerminal is null on fresh state", () => {
    const s = initialState(1, S);
    expect(isTerminal(s)).toBeNull();
  });

  it("choose-path career → career-pick decision; CPU pre-picks a career", () => {
    let s = initialState(7, S);
    s = reducer(s, { type: "choose-path", path: "career" });
    expect(s.phase).toBe("decision-career");
    expect(s.human.path).toBe("career");
    expect(s.human.pos).toBe(0);
    expect(s.cpu.path).toBe("career");
    expect(s.cpu.career).not.toBeNull();
    expect(s.decisionData.careerOptions?.length).toBe(3);
    // Career options should come from non-college deck
    expect(s.decisionData.careerOptions!.every((c) => !c.college)).toBe(true);
  });

  it("choose-path college imposes 4-turn delay and $100k debt; offers college deck", () => {
    let s = initialState(7, S);
    s = reducer(s, { type: "choose-path", path: "college" });
    expect(s.phase).toBe("decision-career");
    expect(s.human.path).toBe("college");
    expect(s.human.debt).toBe(100);
    expect(s.human.collegeTurnsLeft).toBe(4);
    expect(s.human.pos).toBe(-1);
    expect(s.decisionData.careerOptions!.every((c) => c.college)).toBe(true);
  });

  it("pick-career sets salary and advances to spinning", () => {
    let s = initialState(7, S);
    s = reducer(s, { type: "choose-path", path: "career" });
    const opts = s.decisionData.careerOptions!;
    s = reducer(s, { type: "pick-career", index: 0 });
    expect(s.phase).toBe("spinning");
    expect(s.human.career?.name).toBe(opts[0]!.name);
  });

  it("spin advances active player 1-10 squares", () => {
    let s = initialState(11, S);
    s = reducer(s, { type: "choose-path", path: "career" });
    s = reducer(s, { type: "pick-career", index: 0 });
    expect(s.active).toBe("human");
    s = reducer(s, { type: "spin" });
    expect(s.human.pos).toBeGreaterThanOrEqual(1);
    expect(s.human.pos).toBeLessThanOrEqual(10);
    expect(s.human.lastSpin).toBeGreaterThanOrEqual(1);
  });

  it("illegal action returns same state reference", () => {
    const s = initialState(1, S);
    // spin during choose-path is illegal
    const same = reducer(s, { type: "spin" });
    expect(same).toBe(s);
  });

  it("done phase ignores actions", () => {
    let s = initialState(1, S);
    s = { ...s, phase: "done" };
    const same = reducer(s, { type: "spin" });
    expect(same).toBe(s);
  });

  it("reaches done state via full play-through; produces non-negative scores", () => {
    const final = runToEnd(42);
    expect(final.phase).toBe("done");
    expect(isTerminal(final)).not.toBeNull();
    expect(finalScore(final.human)).toBeGreaterThanOrEqual(0);
    expect(finalScore(final.cpu)).toBeGreaterThanOrEqual(0);
    // Both players must have reached the retirement square
    expect(final.human.retired).toBe(true);
    expect(final.cpu.retired).toBe(true);
  });

  it("final score includes house value and subtracts debt", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "choose-path", path: "college" });
    expect(s.human.debt).toBe(100);
    // Build a fake final-ish player: 200 cash, 100 house, 100 debt, married, 2 kids, 5 paydays, countryside
    const p = {
      ...s.human,
      cash: 200,
      houseValue: 100,
      hasHouse: true,
      debt: 100,
      married: true,
      kids: 2,
      paydayCount: 5,
      retired: true,
      retirementChoice: "countryside-acres" as const,
    };
    // = 200 + 100 - 100 + 100 + 5*5 + (2*10 + 20) = 200 + 100 - 100 + 100 + 25 + 40 = 365
    expect(finalScore(p)).toBe(365);
  });

  it("Millionaire Estates penalizes players below $1M cash", () => {
    const s = initialState(1, S);
    const broke = { ...s.human, cash: 500, retired: true, retirementChoice: "millionaire-estates" as const };
    const rich = { ...s.human, cash: 1500, retired: true, retirementChoice: "millionaire-estates" as const };
    // broke: 500 + 0 - 0 + 0 (no bonus, <1000) + 0 + 0 = 500
    expect(finalScore(broke)).toBe(500);
    // rich: 1500 + 0 - 0 + 200 + 0 + 0 = 1700
    expect(finalScore(rich)).toBe(1700);
  });

  it("CPU runs autopilot until human's turn without infinite loops", () => {
    let s = initialState(99, S);
    s = reducer(s, { type: "choose-path", path: "career" });
    s = reducer(s, { type: "pick-career", index: 0 });
    s = reducer(s, { type: "spin" });
    // assume resolved or some decision; resolve until cpu turn
    let safety = 0;
    while (s.active === "human" && s.phase !== "spinning" && safety < 50) {
      // dispatch a sane default
      if (s.phase === "resolved") s = reducer(s, { type: "next" });
      else if (s.phase === "decision-marry") s = reducer(s, { type: "marry-spin" });
      else if (s.phase === "decision-house") s = reducer(s, { type: "buy-house", buy: false });
      else if (s.phase === "decision-sell") s = reducer(s, { type: "sell-house", sell: false });
      else if (s.phase === "decision-insurance") s = reducer(s, { type: "buy-insurance", buy: false });
      else if (s.phase === "decision-spin-win") s = reducer(s, { type: "play-spin-to-win", play: false });
      else if (s.phase === "decision-retire") s = reducer(s, { type: "pick-retirement", choice: "countryside-acres" });
      safety++;
    }
    if (s.phase === "resolved") s = reducer(s, { type: "next" });
    // Now CPU should be active
    expect(s.active).toBe("cpu");
    // CPU step until CPU returns control or terminates
    let safety2 = 0;
    while (s.active === "cpu" && s.phase !== "done" && safety2 < 50) {
      s = reducer(s, { type: "cpu-step" });
      safety2++;
    }
    expect(safety2).toBeLessThan(50);
  });

  it("BOARD has expected size with retire-choice at the end", () => {
    expect(BOARD.length).toBe(32);
    expect(BOARD[BOARD.length - 1]!.kind).toBe("retire-choice");
  });

  it("career decks differ between college and non-college", () => {
    expect(CAREER_CARDS.every((c) => !c.college)).toBe(true);
    expect(COLLEGE_CAREER_CARDS.every((c) => c.college)).toBe(true);
    // college salaries are generally higher than non-college
    const avgNonCol = CAREER_CARDS.reduce((a, c) => a + c.salary, 0) / CAREER_CARDS.length;
    const avgCol = COLLEGE_CAREER_CARDS.reduce((a, c) => a + c.salary, 0) / COLLEGE_CAREER_CARDS.length;
    expect(avgCol).toBeGreaterThan(avgNonCol);
  });
});
