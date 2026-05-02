import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChineseBlackjackCasState, ChineseBlackjackCasAction, ChineseBlackjackCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChineseBlackjackCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const chineseBlackjackCasPlugin: GamePlugin<ChineseBlackjackCasState, ChineseBlackjackCasAction, typeof settings> = {
  id: "chinese-blackjack-cas", title: "Chinese Blackjack", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Chinese Blackjack — multi-deck variant.",
  howToPlay: "Chinese Blackjack — multi-deck variant. Hit to draw, Stand to stop. Bust on 22+ = lose. Doubles down on first two cards. Stand on 17+. Blackjack pays 1.5:1.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as ChineseBlackjackCasSettings),
  reducer, isTerminal, component: ChineseBlackjackCasGame,
};
