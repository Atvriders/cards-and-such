import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TwoTruthsLiePickState, TwoTruthsLiePickAction, TwoTruthsLiePickSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TwoTruthsLiePickGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const twoTruthsLiePickPlugin: GamePlugin<TwoTruthsLiePickState, TwoTruthsLiePickAction, typeof settings> = {
  id: "two-truths-lie-pick",
  title: "Two Truths and a Lie",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two Truths and a Lie prompts.",
  howToPlay: "Two Truths and a Lie solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TwoTruthsLiePickSettings),
  reducer,
  isTerminal,
  component: TwoTruthsLiePickGame,
};

export default twoTruthsLiePickPlugin;
