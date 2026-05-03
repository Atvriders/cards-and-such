import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PresidentsMemoryState, PresidentsMemoryAction, PresidentsMemorySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PresidentsMemoryGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PresidentsMemoryGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const presidentsMemoryPlugin: GamePlugin<PresidentsMemoryState, PresidentsMemoryAction, typeof settings> = {
  id: "presidents-memory", title: "Presidents Memory", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match presidential names with their term numbers.",
  howToPlay: "Presidents Memory pairs commanders-in-chief with their term numbers across fifteen brisk rounds. Each prompt asks 'Which president was the Nth?' and you pick the right name from four candidate options. The roster covers Washington (1st), Adams (2nd), Jefferson (3rd), Madison (4th), Monroe (5th), Lincoln (16th), Theodore Roosevelt (26th), Franklin Roosevelt (32nd), Kennedy (35th), Nixon (37th), Reagan (40th), Clinton (42nd), Obama (44th), Trump (45th), and Biden (46th). The big jumps in numbering reflect the lesser-known presidents we skipped for this drill. Hit Submit to lock your pick — correct selections score ten points each, wrongs zero. After fifteen rounds, max score is 150. Civics buffs hit 130+; casual players land 70-100. Useful as a classroom drill, history-buff warm-up, or family quiz seed. Hit Submit, advance with Next, and finish to see your final tally and accuracy ratio across all fifteen rounds played.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PresidentsMemorySettings),
  reducer, isTerminal, hint: (state: PresidentsMemoryState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-presidents-memory-answer-0"]', pulses: 3 } : null, component: PresidentsMemoryGame,
};
