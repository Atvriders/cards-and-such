import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ThreeHandCribbageState, ThreeHandCribbageAction, ThreeHandCribbageSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ThreeHandCribbageGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: ThreeHandCribbageState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-three-hand-cribbage-primary"]', pulses: 3 };
  if (state.phase === "result") return { selector: '[data-testid="hint-target-three-hand-cribbage-secondary"]', pulses: 3 };
  return null;
};

export const threeHandCribbagePlugin: GamePlugin<ThreeHandCribbageState, ThreeHandCribbageAction, typeof settings> = {
  id: "three-hand-cribbage", title: "Three-Hand Cribbage", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three-handed cribbage cut-game: beat both CPU opponents in nine cuts.",
  howToPlay: "Three-Hand Cribbage condenses the three-player cribbage variant into a fast cut-the-deck race. Each round you cut one card and two CPU opponents each cut one card. Your cut needs to be the strict highest of the three to score the round.\n\nScoring: clear-high cut pegs 10 points. If you tie for first place with one or both opponents, you peg a consolation 3 points. Anything else is zero pegs that round.\n\nNine rounds total — a traditional three-hand cribbage match has the dealer rotating through three positions three times. Cards are drawn from a shared 52-card deck without replacement within a round, so duplicates aren't possible.\n\nExpected score is around 30-50 points per match (your odds of being the unique high are ~1 in 3 each round). A hot run past 70 points is impressive. There are no decisions to make — pure luck and the spirit of three-handed pegging without the bookkeeping.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ThreeHandCribbageSettings),
  reducer, isTerminal, hint: hint, component: ThreeHandCribbageGame,
};
