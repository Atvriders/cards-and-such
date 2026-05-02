import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CryptidUrbanRollState, CryptidUrbanRollAction, CryptidUrbanRollSettings } from "./state.js";
import { CryptidUrbanRoll_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
import { CryptidUrbanRollGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const cryptidUrbanRollPlugin: GamePlugin<CryptidUrbanRollState, CryptidUrbanRollAction, typeof settings> = {
  id: "cryptid-urban-roll",
  title: "Cryptid: Urban Roll",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Urban Cryptid variant.",
  howToPlay: "Cryptid: Urban Roll adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CryptidUrbanRollSettings),
  reducer,
  isTerminal,
  hint: (state: CryptidUrbanRollState): HintTarget | null => {
    const sel = deductionHintSelector(state, CryptidUrbanRoll_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: CryptidUrbanRollGame,
};

export default cryptidUrbanRollPlugin;
