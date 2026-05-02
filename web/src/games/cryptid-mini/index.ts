import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CryptidMiniState, CryptidMiniAction, CryptidMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CryptidMiniGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const cryptidMiniPlugin: GamePlugin<CryptidMiniState, CryptidMiniAction, typeof settings> = {
  id: "cryptid-mini",
  title: "Cryptid Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Find the cryptid hex.",
  howToPlay: "Cryptid Mini adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CryptidMiniSettings),
  reducer,
  isTerminal,
  component: CryptidMiniGame,
};

export default cryptidMiniPlugin;
