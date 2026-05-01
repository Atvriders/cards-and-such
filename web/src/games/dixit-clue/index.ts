import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DixitClueState, DixitClueAction, DixitClueSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DixitClueGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const dixit_clue_plugin: GamePlugin<DixitClueState, DixitClueAction, typeof settings> = {
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
  component: DixitClueGame,
};

export default dixit_clue_plugin;
