import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BanqueCasState, BanqueCasAction, BanqueCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BanqueCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const banqueCasPlugin: GamePlugin<BanqueCasState, BanqueCasAction, typeof settings> = {
  id: "banque-cas", title: "Banque (Baccarat)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Permanent-banker Baccarat variant for casino play.",
  howToPlay: "Banque, also called Baccarat Banque or Baccarat à Deux Tableaux, is a Baccarat variant where one player holds the bank for the entire shoe rather than rotating. The variant is permanent-banker Baccarat and was historically associated with the most exclusive private gaming rooms.\n\nIn this single-player adaptation you play twelve rounds against a fixed dealer-banker. Each round you both draw three cards. The comparison uses sum-of-rank, aces high. You may play (compare) or fold.\n\nA win pays fourteen points (with a king-high bonus of three); a tie pays five; a fold pays zero. Twelve rounds are played.\n\nExpected score across twelve rounds is sixty to ninety. Banque's permanent-banker flavour is reflected in the consistent dealer; you face the same opponent throughout. Standard Baccarat-comparison strategy applies — fold weak hands, play moderate-or-better, and watch for kings to net the high-card bonus. One bonus across the set lands you in the upper band.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BanqueCasSettings),
  reducer, isTerminal, component: BanqueCasGame,
};
