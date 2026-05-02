import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ClueMasterDetectiveState, ClueMasterDetectiveAction, ClueMasterDetectiveSettings } from "./state.js";
import { ClueMasterDetective_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
import { ClueMasterDetectiveGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const clueMasterDetectivePlugin: GamePlugin<ClueMasterDetectiveState, ClueMasterDetectiveAction, typeof settings> = {
  id: "clue-master-detective",
  title: "Clue: Master Detective",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Expanded Clue with more rooms.",
  howToPlay: "Clue: Master Detective adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ClueMasterDetectiveSettings),
  reducer,
  isTerminal,
  hint: (state: ClueMasterDetectiveState): HintTarget | null => {
    const sel = deductionHintSelector(state, ClueMasterDetective_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: ClueMasterDetectiveGame,
};

export default clueMasterDetectivePlugin;
