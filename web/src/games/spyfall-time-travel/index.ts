import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpyfallTimeTravelState, SpyfallTimeTravelAction, SpyfallTimeTravelSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpyfallTimeTravelGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const spyfallTimeTravelPlugin: GamePlugin<SpyfallTimeTravelState, SpyfallTimeTravelAction, typeof settings> = {
  id: "spyfall-time-travel",
  title: "Spyfall: Time Travel Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Time Travel trivia.",
  howToPlay: "Spyfall: Time Travel Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpyfallTimeTravelSettings),
  reducer,
  isTerminal,
  component: SpyfallTimeTravelGame,
};

export default spyfallTimeTravelPlugin;
