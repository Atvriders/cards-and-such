import { describe, expect, it } from "vitest";
import {
  coopInitial,
  coopStep,
  coopScore,
  coopRecommend,
  coopHintSelector,
  type CoopEngineConfig,
  type CoopTactic,
} from "./coop-engine.js";

const tactics: readonly CoopTactic[] = [
  { id: "push", label: "Push", emoji: "P", effort: 4, reliability: 0.8, desc: "" },
  { id: "guard", label: "Guard", emoji: "G", effort: 2, reliability: 1.0, threatPush: 2, desc: "" },
  { id: "rest", label: "Rest", emoji: "R", effort: 1, reliability: 1.0, desc: "" },
];

const cfg: CoopEngineConfig = {
  totalRounds: 3,
  progressTarget: 100, // high so single step won't win
  threatPerRound: 2,
  startMorale: 3,
  threatBreakpoint: 5,
  allyEffort: 1,
  allyClutch: 0.0, // disable clutch for determinism in some tests
  tactics,
  progressLabel: "Progress",
  threatLabel: "Threat",
  moraleLabel: "Morale",
  scenarioLabel: "Test",
  scenarioEmoji: "T",
};

describe("coop-engine", () => {
  it("initial state has zeros and choose phase, step advances round and produces a log entry", () => {
    const s0 = coopInitial(12345, cfg);
    expect(s0.round).toBe(1);
    expect(s0.progress).toBe(0);
    expect(s0.threat).toBe(0);
    expect(s0.morale).toBe(cfg.startMorale);
    expect(s0.phase).toBe("choose");
    expect(s0.log).toEqual([]);

    const s1 = coopStep(s0, cfg, "push");
    expect(s1.round).toBe(2);
    expect(s1.lastTactic).toBe("push");
    // progress should have grown by at least effort+ally (effort min 2, ally 1)
    expect(s1.progress).toBeGreaterThanOrEqual(3);
    expect(s1.log.length).toBe(1);
    expect(s1.log[0]).toMatch(/^R1:/);
    // unknown tactic returns same state (edge case)
    const sBogus = coopStep(s0, cfg, "no-such");
    expect(sBogus).toBe(s0);
  });

  it("coopScore is null until done and reports victory when target reached", () => {
    const s0 = coopInitial(7, cfg);
    expect(coopScore(s0, cfg)).toBeNull();

    // Hand-craft a done state at victory.
    const wonState = {
      ...s0,
      progress: cfg.progressTarget + 5,
      morale: 2,
      threat: 1,
      phase: "done" as const,
    };
    const result = coopScore(wonState, cfg);
    expect(result).not.toBeNull();
    expect(result!.victory).toBe(true);
    // base = 105 + 2*5 = 115; +50 win bonus -1 threat = 164
    expect(result!.score).toBe(164);

    // Loss: morale 0
    const lostState = { ...s0, progress: 10, morale: 0, threat: 3, phase: "done" as const };
    const loss = coopScore(lostState, cfg);
    expect(loss!.victory).toBe(false);
    expect(loss!.score).toBe(Math.max(0, 10 + 0 - 3));
  });

  it("coopRecommend prefers threatPush tactic when threat is near breakpoint, otherwise best EV", () => {
    const s0 = coopInitial(1, cfg);
    // Threat far from breakpoint → should pick best EV (push: 4*0.8=3.2)
    expect(coopRecommend(s0, cfg)).toBe("push");
    expect(coopHintSelector(s0, cfg)).toBe(`[data-testid="hint-target-coop-tactic-push"]`);

    // Threat near breakpoint → should pick guard (has threatPush)
    const nearState = { ...s0, threat: cfg.threatBreakpoint - 1 };
    expect(coopRecommend(nearState, cfg)).toBe("guard");

    // Empty tactics list → null
    const emptyCfg: CoopEngineConfig = { ...cfg, tactics: [] };
    expect(coopRecommend(s0, emptyCfg)).toBeNull();

    // Non-choose phase → null
    const doneState = { ...s0, phase: "done" as const };
    expect(coopRecommend(doneState, cfg)).toBeNull();
    expect(coopHintSelector(doneState, cfg)).toBeNull();
  });
});
