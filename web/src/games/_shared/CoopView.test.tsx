import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CoopView } from "./CoopView.js";
import {
  coopInitial,
  coopScore,
  type CoopEngineConfig,
  type CoopTactic,
} from "./coop-engine.js";

const tactics: readonly CoopTactic[] = [
  { id: "push", label: "Push", emoji: "P", effort: 4, reliability: 0.8, desc: "Press forward" },
  { id: "guard", label: "Guard", emoji: "G", effort: 2, reliability: 1.0, threatPush: 2, desc: "Hold the line" },
  { id: "rest", label: "Rest", emoji: "R", effort: 1, reliability: 1.0, desc: "Catch a breath" },
];

const cfg: CoopEngineConfig = {
  totalRounds: 3,
  progressTarget: 100,
  threatPerRound: 2,
  startMorale: 3,
  threatBreakpoint: 5,
  allyEffort: 1,
  allyClutch: 0.0,
  tactics,
  progressLabel: "Progress",
  threatLabel: "Threat",
  moraleLabel: "Morale",
  scenarioLabel: "Test Scenario",
  scenarioEmoji: "X",
};

describe("CoopView", () => {
  it("renders the scenario header, round counter, bars, and one button per tactic in the choose phase", () => {
    const state = coopInitial(42, cfg);
    render(
      <CoopView
        prefix="coop"
        cfg={cfg}
        state={state}
        onPlay={() => {}}
        onGameOver={() => {}}
        scoreFn={(s) => coopScore(s, cfg)}
        intro="Welcome agent"
      />,
    );
    // Scenario label and round counter
    expect(screen.getByText("Test Scenario")).toBeInTheDocument();
    expect(screen.getByText("Round 1/3")).toBeInTheDocument();
    // Intro flavor text
    expect(screen.getByText("Welcome agent")).toBeInTheDocument();
    // Bar labels include progress and threat values
    expect(screen.getByText("Progress 0 / 100")).toBeInTheDocument();
    expect(screen.getByText("Threat 0 / 5")).toBeInTheDocument();
    // One button per tactic, each enabled and tagged with the hint testid
    for (const t of tactics) {
      const btn = screen.getByTestId(`hint-target-coop-tactic-${t.id}`) as HTMLButtonElement;
      expect(btn).toBeInTheDocument();
      expect(btn.disabled).toBe(false);
      expect(btn.className).toContain("coop-tactic");
    }
  });

  it("disables all tactic buttons when phase is not 'choose'", () => {
    const state = { ...coopInitial(1, cfg), phase: "resolved" as const };
    render(
      <CoopView
        prefix="coop"
        cfg={cfg}
        state={state}
        onPlay={() => {}}
        onGameOver={() => {}}
        scoreFn={() => null}
      />,
    );
    for (const t of tactics) {
      const btn = screen.getByTestId(`hint-target-coop-tactic-${t.id}`) as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    }
  });

  it("renders the final summary panel when the game is done", () => {
    const state = {
      ...coopInitial(1, cfg),
      phase: "done" as const,
      progress: cfg.progressTarget + 5,
      morale: 2,
      threat: 1,
    };
    render(
      <CoopView
        prefix="coop"
        cfg={cfg}
        state={state}
        onPlay={() => {}}
        onGameOver={() => {}}
        scoreFn={(s) => coopScore(s, cfg)}
      />,
    );
    expect(screen.getByText("Mission Success!")).toBeInTheDocument();
    // Score line for a victory state — exact score computed by coopScore
    expect(screen.getByText(/Score:\s*164/)).toBeInTheDocument();
    // The final-stats line mentions both progress and morale labels
    expect(
      screen.getByText(/Progress:\s*105\s*\/\s*100/),
    ).toBeInTheDocument();
  });
});
