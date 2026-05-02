import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { FourSeasonsState, FourSeasonsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FourSeasons } from "./FourSeasons.js";

export const fourSeasonsSettings = {} as const;

export const fourSeasonsPlugin: GamePlugin<FourSeasonsState, FourSeasonsAction, typeof fourSeasonsSettings> = {
  id: "four-seasons",
  title: "Four Seasons",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A cross-layout solitaire where the starting rank is random and foundations wrap around.",
  howToPlay: `Four Seasons (also called Corner Card or Vanishing Cross) is a compact solitaire with an elegant twist: the rank that starts each foundation is determined randomly by the first card dealt.

Layout: The game opens with four foundation piles in the corners and five tableau piles arranged in a cross (plus-sign) shape, each holding one card. The rest of the deck forms the stock.

Foundations: Build up by suit starting from whichever rank appears first in the deal — the starting rank is shown at the top. The sequence wraps around: if the start rank is 5, foundations build 5-6-7-8-9-10-J-Q-K-A-2-3-4.

Tableau: The five cross piles build downward by rank, any suit — a 7 of any suit goes on an 8 of any suit. Empty tableau slots accept any single card.

Draw: Flip one card at a time from the stock to the waste. No redeal is allowed, so plan your discards carefully.

Strategy: Identify the starting rank and prioritize clearing same-rank cards to foundations quickly. With only 5 tableau piles and a single pass through the stock, every move counts.

Win condition: All 52 cards on the four foundations.`,
  settings: fourSeasonsSettings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: FourSeasons,
};
