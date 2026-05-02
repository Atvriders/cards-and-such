import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ReverseCharadesQuizState, ReverseCharadesQuizAction, ReverseCharadesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ReverseCharadesQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const reverseCharadesQuizPlugin: GamePlugin<ReverseCharadesQuizState, ReverseCharadesQuizAction, typeof settings> = {
  id: "reverse-charades-quiz",
  title: "Reverse Charades Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Group-acts party charades trivia.",
  howToPlay: "Reverse Charades Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ReverseCharadesQuizSettings),
  reducer,
  isTerminal,
  component: ReverseCharadesQuizGame,
};

export default reverseCharadesQuizPlugin;
