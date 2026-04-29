import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RoyalCasinoState, RoyalCasinoAction, RoyalCasinoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RoyalCasinoGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const royalCasinoPlugin: GamePlugin<RoyalCasinoState, RoyalCasinoAction, typeof settings> = {
  id: "royal-casino", title: "Royal Casino", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Casino variant where face cards score: capture vs CPU.",
  howToPlay: "Royal Casino is a Casino variant where face cards (Jack, Queen, King) hold formal capture-values: J=11, Q=12, K=13. This mini-version models capture as a per-round high-card race against the CPU.\n\nEach round, you and the CPU each draw one card. Higher rank wins. The capture-value scheme treats face cards as their ranking number (J=11, Q=12, K=13, A=1 or 14 depending on house rule — here Ace = 13).\n\nScoring: round win awards 12 points (the bigger payout reflects the higher-value face captures of Royal Casino). Tie awards 4 sympathy points. Loss awards zero.\n\nTen rounds total. Expected score is 55-80 points; great runs cross 90.\n\nThe full Royal Casino has table-cards on the felt that you capture by sum or by direct rank-match. This mini-version captures the \"court cards score points\" energy without the math. A simpler, more direct take on a classic 18th-century French capture game.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RoyalCasinoSettings),
  reducer, isTerminal, component: RoyalCasinoGame,
};
