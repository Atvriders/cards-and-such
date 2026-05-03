import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget} from "../../platform/game-plugin/types.js";
import type { strixhavenCurriculumState, strixhavenCurriculumAction, strixhavenCurriculumSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const strixhavenCurriculumGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.strixhavenCurriculumGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const strixhavenCurriculumPlugin: GamePlugin<strixhavenCurriculumState, strixhavenCurriculumAction, typeof settings> = {
  id: "strixhaven-curriculum",
  title: "Strixhaven Curriculum",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Magic-school roll-and-write — study subjects on a 4x4 spell grid.",
  howToPlay: "Strixhaven Curriculum is a magic-school themed roll-and-write distilled to a 4x4 spell-study grid. Each row represents a college (Lorehold, Prismari, Quandrix, Silverquill); each cell is a spell to inscribe.\n\nPress Roll to draw a study die (1-6). Click any unmarked cell to record the die value as the spell's mastery score (2 points per cell). Twelve study turns total — pick wisely.\n\nCompleting any row earns a College Honors bonus of +5, and any full column earns a Cross-Discipline bonus of +5. Master the entire curriculum (all sixteen cells) for a +10 Valedictorian bonus.\n\nSkipping costs nothing but consumes a turn. Strong scholars score 35-45; valedictorian-track players hit 55+.\n\nThis adaptation simplifies the original Magic the Gathering Strixhaven roll-and-write expansion: you don't choose colleges by drafting cards, but the grid-by-college structure and twelve-turn arc remain. Whisper an incantation, click a cell, and watch your magical schooling unfold one spell at a time.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as strixhavenCurriculumSettings),
  reducer,
  isTerminal, hint: (state: strixhavenCurriculumState): HintTarget | null => (state.phase === "rolling" ? { selector: '[data-testid="hint-target-strixhaven-curriculum-primary"]', pulses: 3 } : null),
  component: strixhavenCurriculumGame,
};
