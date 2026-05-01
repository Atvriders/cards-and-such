import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniBaccaratCasState, MiniBaccaratCasAction, MiniBaccaratCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniBaccaratCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const mb-cPlugin: GamePlugin<MiniBaccaratCasState, MiniBaccaratCasAction, typeof settings> = {
  id: "mini-baccarat-cas", title: "Mini Baccarat", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mini Baccarat — bet on Player or Banker, the higher total wins.",
  howToPlay: "Mini Baccarat — bet on Player or Banker, the higher total wins. Bet on Player, Banker, or Tie. Cards drawn following baccarat rules. Higher of two totals (mod 10) wins. Player pays 20, Banker pays 19, Tie pays 80.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as MiniBaccaratCasSettings),
  reducer, isTerminal, component: MiniBaccaratCasGame,
};
