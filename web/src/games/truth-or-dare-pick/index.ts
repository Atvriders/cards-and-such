import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TruthOrDarePickState, TruthOrDarePickAction, TruthOrDarePickSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TruthOrDarePickGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const truthOrDarePickPlugin: GamePlugin<TruthOrDarePickState, TruthOrDarePickAction, typeof settings> = {
  id: "truth-or-dare-pick",
  title: "Truth or Dare",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Truth-or-dare prompts.",
  howToPlay: "Truth or Dare solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TruthOrDarePickSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "ask") return { selector: '[data-testid="hint-target-truth-or-dare-pick-primary"]', pulses: 3 };
      if (state.phase === "feedback") return { selector: '[data-testid="hint-target-truth-or-dare-pick-next"]', pulses: 3 };
      return null;
    },
  component: TruthOrDarePickGame,
};

export default truthOrDarePickPlugin;
