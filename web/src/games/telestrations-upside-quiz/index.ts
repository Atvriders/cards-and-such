import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TelestrationsUpsideQuizState, TelestrationsUpsideQuizAction, TelestrationsUpsideQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TelestrationsUpsideQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const telestrationsUpsideQuizPlugin: GamePlugin<TelestrationsUpsideQuizState, TelestrationsUpsideQuizAction, typeof settings> = {
  id: "telestrations-upside-quiz",
  title: "Telestrations: Upside Drawn Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Upside-Drawn variant trivia.",
  howToPlay: "Telestrations: Upside Drawn Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TelestrationsUpsideQuizSettings),
  reducer,
  isTerminal,
  component: TelestrationsUpsideQuizGame,
};

export default telestrationsUpsideQuizPlugin;
