import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CryptidDeductionState, CryptidDeductionAction, CryptidDeductionSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CryptidDeductionGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const cryptid_deduction_plugin: GamePlugin<CryptidDeductionState, CryptidDeductionAction, typeof settings> = {
  id: "cryptid-deduction",
  title: "Cryptid Deduction",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cryptid logic puzzle.",
  howToPlay: "Cryptid Deduction adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CryptidDeductionSettings),
  reducer,
  isTerminal,
  component: CryptidDeductionGame,
};

export default cryptid_deduction_plugin;
