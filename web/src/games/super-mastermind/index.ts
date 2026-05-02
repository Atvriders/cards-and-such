import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SuperMastermindState, SuperMastermindAction, SuperMastermindSettings } from "./state.js";
import { SuperMastermind_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
import { SuperMastermindGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const superMastermindPlugin: GamePlugin<SuperMastermindState, SuperMastermindAction, typeof settings> = {
  id: "super-mastermind",
  title: "Super Mastermind",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Five-peg eight-color Mastermind.",
  howToPlay: "Super Mastermind adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SuperMastermindSettings),
  reducer,
  isTerminal,
  hint: (state: SuperMastermindState): HintTarget | null => {
    const sel = deductionHintSelector(state, SuperMastermind_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: SuperMastermindGame,
};

export default superMastermindPlugin;
