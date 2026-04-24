import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, PRIZES } from "./state.js";

const S_ALL = { lifelines: "all" as const };
const S_NONE = { lifelines: "none" as const };

describe("millionaire state", () => {
  it("starts at level 0 with score 0 in playing phase", () => {
    const s = initialState(1, S_ALL);
    expect(s.level).toBe(0);
    expect(s.score).toBe(0);
    expect(s.phase).toBe("playing");
    expect(s.questions.length).toBe(15);
    expect(s.lifeline5050Used).toBe(false);
    expect(s.lifelineAudienceUsed).toBe(false);
    expect(s.lifelinePhoneUsed).toBe(false);
  });

  it("advances level and awards prize on correct answer", () => {
    let s = initialState(1, S_ALL);
    const correctChoice = s.questions[0]!.correct;
    s = reducer(s, { type: "answer", choice: correctChoice });
    expect(s.level).toBe(1);
    expect(s.score).toBe(PRIZES[0]);
    expect(s.phase).toBe("playing");
  });

  it("sets wrong phase and drops to safety net on incorrect answer", () => {
    let s = initialState(1, S_ALL);
    const correctChoice = s.questions[0]!.correct;
    const wrongChoice = ((correctChoice + 1) % 4) as 0 | 1 | 2 | 3;
    s = reducer(s, { type: "answer", choice: wrongChoice });
    expect(s.phase).toBe("wrong");
    expect(s.score).toBe(0); // no safety net reached yet
    const terminal = isTerminal(s);
    expect(terminal).not.toBeNull();
    expect(terminal!.score).toBe(0);
  });

  it("walk_away ends game and returns current prize", () => {
    let s = initialState(1, S_ALL);
    const correctChoice = s.questions[0]!.correct;
    s = reducer(s, { type: "answer", choice: correctChoice });
    // Now at level 1, walk away
    s = reducer(s, { type: "walk_away" });
    expect(s.phase).toBe("walk_away");
    const terminal = isTerminal(s);
    expect(terminal).not.toBeNull();
    expect(terminal!.score).toBe(PRIZES[0]);
  });

  it("50:50 lifeline eliminates 2 wrong options", () => {
    let s = initialState(1, S_ALL);
    s = reducer(s, { type: "use_5050" });
    const eliminatedCount = s.eliminated.filter(Boolean).length;
    expect(eliminatedCount).toBe(2);
    expect(s.eliminated[s.questions[0]!.correct]).toBe(false);
    expect(s.lifeline5050Used).toBe(true);
  });

  it("audience lifeline shows votes summing to 100", () => {
    let s = initialState(1, S_ALL);
    s = reducer(s, { type: "use_audience" });
    expect(s.phase).toBe("lifeline_audience");
    const total = s.audienceVotes.reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
    s = reducer(s, { type: "dismiss_lifeline" });
    expect(s.phase).toBe("playing");
    expect(s.lifelineAudienceUsed).toBe(true);
  });

  it("isTerminal returns null while playing", () => {
    const s = initialState(1, S_ALL);
    expect(isTerminal(s)).toBeNull();
  });
});
