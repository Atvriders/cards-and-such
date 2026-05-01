import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { JottoState, JottoAction, JottoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { JottoGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const jotto_plugin: GamePlugin<JottoState, JottoAction, typeof settings> = {
  id: "jotto",
  title: "Jotto",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Five-letter unique-letter word puzzle.",
  howToPlay: "Jotto adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as JottoSettings),
  reducer,
  isTerminal,
  component: JottoGame,
};

export default jotto_plugin;
