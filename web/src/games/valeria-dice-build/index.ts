import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { ValeriaDiceBuildState, ValeriaDiceBuildAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ValeriaDiceBuild = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ValeriaDiceBuild as unknown as React.ComponentType<unknown> })));
const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const valeriaDiceBuildPlugin: GamePlugin<ValeriaDiceBuildState, ValeriaDiceBuildAction, typeof settings> = {
  id: "valeria-dice-build",
  title: "Valeria Dice Build",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Use dice to activate citizen cards.",
  howToPlay: "Valeria Dice Build is a quick solo dice game. Use dice to activate citizen cards. Each round you roll five six-sided dice and score points based on the round's special twist: Roll 5 dice; each face activates a citizen — citizens score doubled if rolled twice.\n\nPress the Roll button to throw all five dice. After they land you'll see the round's calculated score added to your total. Some rounds may pay nothing if the dice don't match the pattern; others can pay a hefty bonus.\n\nAim for the highest cumulative total over ten rounds. Strategy comes from understanding which patterns are most likely to score well — sums and matching pairs/triples are the most common scoring elements.\n\nWhen the tenth round ends, your final score is logged. Compare runs against your previous high scores. The dice are seeded so each session is reproducible — return to the exact same sequence by replaying with the same seed.\n\nSingle-player only. No CPU opponent — just you, the dice, and the scoring rules. A great filler for two minutes of casual play, with a satisfying push for higher and higher scores as you learn the patterns.",
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer,
  isTerminal,
  hint: (state: ValeriaDiceBuildState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-valeria-dice-build-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-valeria-dice-build-next"]', pulses: 3 };
    return null;
  },
  component: ValeriaDiceBuild,
};
