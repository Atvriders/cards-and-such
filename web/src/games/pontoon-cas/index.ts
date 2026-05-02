import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PontoonCasState, PontoonCasAction, PontoonCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PontoonCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const pontoonCasPlugin: GamePlugin<PontoonCasState, PontoonCasAction, typeof settings> = {
  id: "pontoon-cas", title: "Pontoon", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pontoon — British BJ. Pontoon (21 on first two) pays 2:1.",
  howToPlay: "Pontoon — British BJ. Pontoon (21 on first two) pays 2:1. Hit to draw, Stand to stop. Bust on 22+ = lose. Doubles down on first two cards. Stand on 17+. Blackjack pays 2.0:1.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as PontoonCasSettings),
  reducer, isTerminal, component: PontoonCasGame,
};
