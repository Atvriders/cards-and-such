import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PhaseTenShedState, PhaseTenShedAction, PhaseTenShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PhaseTenShedGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const phaseTenShedPlugin: GamePlugin<PhaseTenShedState, PhaseTenShedAction, typeof settings> = {
  id: "phase-ten-shed", title: "Phase Ten", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Phase-objective shedding game — score for completing the round's required phase.",
  howToPlay: "Phase Ten is a shedding card game with sequential phase objectives. Each round demands a specific structure of melds (sets and runs) before you can go out. In this short version, each round you are dealt nine cards and the engine attempts to build the round's phase from your hand.\n\nThe phase objectives rotate: round one needs two sets of three, round two needs one set and one run, round three needs two runs of four, and so on. Completing the phase earns thirty points plus five points per leftover card. Failing the phase scores zero.\n\nSix rounds are played. The deck and your luck mostly decide whether each phase completes. Typical success rate hovers around forty per cent, so a run lands around seventy points on average. A clean six-round sweep could push past 180.\n\nHolding mixed suits and mid-rank cards generally helps, but in this no-decision auto-score variant the deck is the boss. Just deal, score, and grin or wince.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PhaseTenShedSettings),
  reducer, isTerminal, component: PhaseTenShedGame,
};
