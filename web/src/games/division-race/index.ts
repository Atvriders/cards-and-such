import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DivisionRaceState, DivisionRaceAction, DivisionRaceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DivisionRaceGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DivisionRaceGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const divisionRacePlugin: GamePlugin<DivisionRaceState, DivisionRaceAction, typeof settings> = {
  id: "division-race", title: "Division Race", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Quick division flashcards. 20 questions; 60-second clock.",
  howToPlay: `Division Race is a fast-paced mental-math sprint focused on whole-number division. You have 60 seconds to power through up to 20 division flashcards. Each card shows a clean division like "84 ÷ 7 = ?" with four numeric choices — every problem produces a whole-number quotient, so there are no decimals or remainders to worry about.

Divisors range from 2 through 12, and quotients also fall in that range, so dividends top out at 144. Wrong answer choices are clustered close to the correct one, so quickly identifying the largest or smallest won't help — you really need to know your division facts (or recover them from your multiplication tables).

Wrong answers don't reduce your score, but they slow you down. The clock counts down in red at the top of the screen. When time runs out or you finish all 20, your final score is locked in.

Maximum is 200 points (20 correct x 10). Average runs land near 100-150. Drill those tables and chase the perfect run!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DivisionRaceSettings),
  reducer, isTerminal, hint: (state: DivisionRaceState): HintTarget | null => (state.phase !== "done" ? { selector: ".mr-choice", pulses: 3 } : null), component: DivisionRaceGame,
};
