import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OklahomaGinRState, OklahomaGinRAction, OklahomaGinRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OklahomaGinRGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Bot", options: ["easy", "hard"] as const, default: "hard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const oklahomaGinRPlugin: GamePlugin<OklahomaGinRState, OklahomaGinRAction, typeof settings> = {
  id: "oklahoma-gin-r",
  title: "Oklahoma Gin",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Gin variant where the first upcard sets the knock limit.",
  howToPlay: "Oklahoma Gin is Gin Rummy with a twist: the first discard determines the maximum knock value. Draw from stock or discard, form sets and runs, and knock when deadwood is at or below the limit. Gin (zero deadwood) earns a 25-point bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as OklahomaGinRSettings),
  reducer,
  isTerminal,
  component: OklahomaGinRGame,
};
