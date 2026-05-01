import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CheminDeFerCasState, CheminDeFerCasAction, CheminDeFerCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CheminDeFerCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cdf-cPlugin: GamePlugin<CheminDeFerCasState, CheminDeFerCasAction, typeof settings> = {
  id: "chemin-de-fer-cas", title: "Chemin de Fer", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Chemin de Fer — original baccarat, players take turns banking.",
  howToPlay: "Chemin de Fer — original baccarat, players take turns banking. Bet on Player, Banker, or Tie. Cards drawn following baccarat rules. Higher of two totals (mod 10) wins. Player pays 20, Banker pays 19, Tie pays 80.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as CheminDeFerCasSettings),
  reducer, isTerminal, component: CheminDeFerCasGame,
};
