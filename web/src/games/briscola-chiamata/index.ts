import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BriscolaChiamataState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BriscolaChiamata } from "./BriscolaChiamata.js";

const briscolaChiamataSettings = {} as const;
type BriscolaChiamataSettings = SettingsOf<typeof briscolaChiamataSettings>;
type BriscolaChiamataAction = { type: "play"; cardId: string };

export const briscolaChiamataPlugin: GamePlugin<BriscolaChiamataState, BriscolaChiamataAction, typeof briscolaChiamataSettings> = {
  id: "briscola-chiamata",
  title: "Briscola Chiamata",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "5-player called Briscola — reduced to a 1v1 trick duel.",
  howToPlay: `Briscola Chiamata is the 5-player called variant of Briscola where the bidder names a partner via a secret card. This simplified 1v1 duel preserves only the trick-play core, with diamonds as trump. You and the bot each receive 8 cards from a 40-card Italian deck (A, 2, 3, 4, 5, 6, 7, J, Q, K in each suit — no 8/9/10). Each trick: follow the led suit if able, else play any card. Highest diamond wins; otherwise highest of the led suit. Click cards to play. Trick winner leads next. Strategy: in Briscola, the Ace and 3 are the highest cards regardless of suit ranking, but here we use rank order with Ace high for simplicity. Lead long side suits to flush trumps, save trump-aces for the right trick. Capture 5 of 8 tricks to win.`,
  settings: briscolaChiamataSettings,
  initialState: (seed: number, _settings: BriscolaChiamataSettings) => initialState(seed),
  reducer,
  isTerminal,
  component: BriscolaChiamata,
};
