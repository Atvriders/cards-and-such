import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ClueSuspectState, ClueSuspectAction, ClueSuspectSettings } from "./state.js";
import { ClueSuspect_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
import { ClueSuspectGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const clueSuspectPlugin: GamePlugin<ClueSuspectState, ClueSuspectAction, typeof settings> = {
  id: "clue-suspect",
  title: "Clue: Suspect",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Suspect-themed Clue card game.",
  howToPlay: "Clue: Suspect adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ClueSuspectSettings),
  reducer,
  isTerminal,
  hint: (state: ClueSuspectState): HintTarget | null => {
    const sel = deductionHintSelector(state, ClueSuspect_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: ClueSuspectGame,
};

export default clueSuspectPlugin;
