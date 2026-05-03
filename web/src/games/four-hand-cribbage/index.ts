import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FourHandCribbageState, FourHandCribbageAction, FourHandCribbageSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FourHandCribbageGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: FourHandCribbageState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-four-hand-cribbage-primary"]', pulses: 3 };
  if (state.phase === "result") return { selector: '[data-testid="hint-target-four-hand-cribbage-secondary"]', pulses: 3 };
  return null;
};

export const fourHandCribbagePlugin: GamePlugin<FourHandCribbageState, FourHandCribbageAction, typeof settings> = {
  id: "four-hand-cribbage", title: "Four-Hand Cribbage", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Partnership cribbage: your cut paired with partner beats opposing pair.",
  howToPlay: "Four-Hand Cribbage models the partnership variant of cribbage as a paired-cut contest. You and a CPU partner cut one card each; two CPU opponents form the other team and also cut one card each. The two card values on each side are summed, and the higher partnership-total wins the round.\n\nScoring: partnership win pegs 12 points to your team's running total. A tie pegs 4 sympathy points. Loss pegs zero. Aces count as 1, face cards as 11/12/13.\n\nTen rounds simulate a brisk 121-board pegging journey. All four cards are drawn from a shared 52-card deck without replacement per round, so each round is a fresh independent shuffle.\n\nExpected score is around 60-90 points; spectacular runs cross 110. The board representation is implicit — your score is your peg position. No melding, no crib, no pone — just team luck and the cooperative feel of partnership cribbage. A relaxing introduction to the four-handed game.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FourHandCribbageSettings),
  reducer, isTerminal, hint: hint, component: FourHandCribbageGame,
};
