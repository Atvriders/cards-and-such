import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { Mastermind5peg8colorState, Mastermind5peg8colorAction, Mastermind5peg8colorSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Mastermind5peg8colorGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const mastermind5peg8colorPlugin: GamePlugin<Mastermind5peg8colorState, Mastermind5peg8colorAction, typeof settings> = {
  id: "mastermind-5peg-8color",
  title: "Mastermind 5/8",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "5 pegs, 8 colors variant.",
  howToPlay: "Mastermind 5/8 adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Mastermind5peg8colorSettings),
  reducer,
  isTerminal,
  component: Mastermind5peg8colorGame,
};

export default mastermind5peg8colorPlugin;
