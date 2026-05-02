import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DecryptoCodesState, DecryptoCodesAction, DecryptoCodesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DecryptoCodesGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const decryptoCodesPlugin: GamePlugin<DecryptoCodesState, DecryptoCodesAction, typeof settings> = {
  id: "decrypto-codes",
  title: "Decrypto Codes",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Decode the 3-digit secret cipher.",
  howToPlay: "Decrypto Codes adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DecryptoCodesSettings),
  reducer,
  isTerminal,
  component: DecryptoCodesGame,
};

export default decryptoCodesPlugin;
