import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DixitClueState, DixitClueAction, DixitClueSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DixitClueGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const dixitCluePlugin: GamePlugin<DixitClueState, DixitClueAction, typeof settings> = {
  id: "dixit-clue",
  title: "Dixit Clue",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dixit clue-puzzle trivia.",
  howToPlay: "Dixit Clue solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DixitClueSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "ask") return { selector: '[data-testid="hint-target-dixit-clue-primary"]', pulses: 3 };
      if (state.phase === "feedback") return { selector: '[data-testid="hint-target-dixit-clue-next"]', pulses: 3 };
      return null;
    },
  component: DixitClueGame,
};

export default dixitCluePlugin;
