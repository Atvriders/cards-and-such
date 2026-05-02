import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MafiaQuizState, MafiaQuizAction, MafiaQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MafiaQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const mafiaQuizPlugin: GamePlugin<MafiaQuizState, MafiaQuizAction, typeof settings> = {
  id: "mafia-quiz",
  title: "Mafia Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mafia / Werewolf trivia.",
  howToPlay: "Mafia Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MafiaQuizSettings),
  reducer,
  isTerminal,
  component: MafiaQuizGame,
};

export default mafiaQuizPlugin;
