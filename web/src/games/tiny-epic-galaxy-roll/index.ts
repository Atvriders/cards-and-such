import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { TinyEpicGalaxyRollState, TinyEpicGalaxyRollAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TinyEpicGalaxyRoll = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TinyEpicGalaxyRoll as unknown as React.ComponentType<unknown> })));
const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const tinyEpicGalaxyRollPlugin: GamePlugin<TinyEpicGalaxyRollState, TinyEpicGalaxyRollAction, typeof settings> = {
  id: "tiny-epic-galaxy-roll",
  title: "Tiny Epic Galaxy Roll",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dice-rolling civilization in a small box.",
  howToPlay: "Tiny Epic Galaxy Roll is a quick solo dice game. Dice-rolling civilization in a small box. Each round you roll five six-sided dice and score points based on the round's special twist: Roll 5 dice; specific patterns advance fuel/colony tracks; race to colonize.\n\nPress the Roll button to throw all five dice. After they land you'll see the round's calculated score added to your total. Some rounds may pay nothing if the dice don't match the pattern; others can pay a hefty bonus.\n\nAim for the highest cumulative total over ten rounds. Strategy comes from understanding which patterns are most likely to score well — sums and matching pairs/triples are the most common scoring elements.\n\nWhen the tenth round ends, your final score is logged. Compare runs against your previous high scores. The dice are seeded so each session is reproducible — return to the exact same sequence by replaying with the same seed.\n\nSingle-player only. No CPU opponent — just you, the dice, and the scoring rules. A great filler for two minutes of casual play, with a satisfying push for higher and higher scores as you learn the patterns.",
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-tiny-epic-galaxy-roll-action"]', pulses: 3 }; },
  component: TinyEpicGalaxyRoll,
};
