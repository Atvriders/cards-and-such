import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BanqueCasState, BanqueCasAction, BanqueCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BanqueCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const banq-cPlugin: GamePlugin<BanqueCasState, BanqueCasAction, typeof settings> = {
  id: "banque-cas", title: "Baccarat Banque", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Baccarat Banque — fixed banker variant.",
  howToPlay: "Baccarat Banque — fixed banker variant. Bet on Player, Banker, or Tie. Cards drawn following baccarat rules. Higher of two totals (mod 10) wins. Player pays 20, Banker pays 19, Tie pays 80.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as BanqueCasSettings),
  reducer, isTerminal, component: BanqueCasGame,
};
