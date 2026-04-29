import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChineseBlackjackCasState, ChineseBlackjackCasAction, ChineseBlackjackCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChineseBlackjackCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const chineseBlackjackCasPlugin: GamePlugin<ChineseBlackjackCasState, ChineseBlackjackCasAction, typeof settings> = {
  id: "chinese-blackjack-cas", title: "Chinese Blackjack", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ban-luck variant with special hands.",
  howToPlay: "Chinese Blackjack, also called Ban-Luck or Kampuchea, is a Blackjack variant popular in Singapore, Malaysia, and southern China. Special hands include 'Ban-Ban' (two aces), 'Ban-Luck' (Ace + 10/J/Q/K), and 'Free Hand' (5-card 21).\n\nIn this single-player version you play fifteen rounds against the dealer. Each round press Play to deal two cards to you and the dealer. Hit or stand normally. Special hands pay enhanced amounts: Ban-Ban pays fifty, Ban-Luck pays thirty, Free Hand pays forty.\n\nThe dealer is bound by special hand-tier rules and may be forced to keep playing if they have certain hands. A standard win pays twenty. A strong total across fifteen rounds is around two hundred and fifty.\n\nChinese Blackjack is traditionally played at Chinese New Year reunions and in mahjong parlours throughout Southeast Asia. The dealer-tier rules make it more chaotic and exciting than Western Blackjack. Press Play and chase Ban-Luck.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ChineseBlackjackCasSettings),
  reducer, isTerminal, component: ChineseBlackjackCasGame,
};
