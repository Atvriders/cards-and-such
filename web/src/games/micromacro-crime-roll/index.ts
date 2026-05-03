import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MicromacroCrimeRollState, MicromacroCrimeRollAction, MicromacroCrimeRollSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MicromacroCrimeRollGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MicromacroCrimeRollGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const micromacroCrimeRollPlugin: GamePlugin<MicromacroCrimeRollState, MicromacroCrimeRollAction, typeof settings> = {
  id: "micromacro-crime-roll",
  title: "MicroMacro: Crime Roll",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Giant-map investigation roll-and-write; movement across city sheet.",
  howToPlay: "MicroMacro: Crime Roll is a roll-and-write detective adventure where dice drive your investigator across a city map sheet, hunting clues at zone cells.\n\nEach round, click Roll to draw a die (1-6) representing investigator stamina. Click any unmarked city zone (cell) to mark a clue gathered there. The pip value is the clue's importance. Skip wastes a round if no zone seems worth investigating.\n\nScoring:\n- Each clue scores its pip value (1-6).\n- +5 per row of zones cleared (district solved).\n- +5 per column of zones cleared (cross-city case).\n- +10 bonus if every zone is investigated (case closed).\n\n12 rolls available. Strategy: high pips reveal major clues, so place them in dense zones (intersection of row+column you're targeting). Skip only when blocked. A baseline detective run scores 35-50; thorough sweeping nets 60+. MicroMacro: Crime Roll captures the thrill of zoom-and-pan investigation in a self-contained sheet game; every roll is a fresh lead.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MicromacroCrimeRollSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if ((state as any).phase === "done") return null;
    if ((state as any).phase === "rolling") return { selector: '[data-testid="hint-target-micromacro-crime-roll-roll"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-micromacro-crime-roll-skip"]', pulses: 3 };
  },
  component: MicromacroCrimeRollGame,
};
