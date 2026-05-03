import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { NeverHaveIEverPickState, NeverHaveIEverPickAction, NeverHaveIEverPickSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NeverHaveIEverPickGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const neverHaveIEverPickPlugin: GamePlugin<NeverHaveIEverPickState, NeverHaveIEverPickAction, typeof settings> = {
  id: "never-have-i-ever-pick",
  title: "Never Have I Ever",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Never Have I Ever prompts.",
  howToPlay: "Never Have I Ever solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as NeverHaveIEverPickSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "ask") return { selector: '[data-testid="hint-target-never-have-i-ever-pick-primary"]', pulses: 3 };
      if (state.phase === "feedback") return { selector: '[data-testid="hint-target-never-have-i-ever-pick-next"]', pulses: 3 };
      return null;
    },
  component: NeverHaveIEverPickGame,
};

export default neverHaveIEverPickPlugin;
