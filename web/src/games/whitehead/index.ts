import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { WhiteheadState, WhiteheadAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Whitehead } from "./Whitehead.js";

export const whiteheadSettings = {} as const;

export const whiteheadPlugin: GamePlugin<WhiteheadState, WhiteheadAction, typeof whiteheadSettings> = {
  id: "whitehead",
  title: "Whitehead",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Klondike variant where all cards are dealt face-up and build same-color down.",
  howToPlay: `Whitehead is a Klondike variant with two key twists: all tableau cards are dealt face-up from the start, and the tableau builds by same color rather than alternating color.

Deal: Seven columns are dealt in the classic Klondike triangle — 1, 2, 3, 4, 5, 6, 7 cards. Unlike Klondike, every card is face-up from the start, so you can see the entire layout immediately. The remaining 24 cards form the stock.

Tableau: Columns build downward in same color — a red card goes on a red card one rank higher. A 7 of hearts goes on an 8 of diamonds, for example. However, only a valid same-suit consecutive sequence may be moved as a group. Moving a single card is always allowed. Empty columns accept any card.

Stock: Click the stock to draw one card at a time to the waste pile. There is no redeal — once the stock is exhausted, the waste stays.

Foundations: Build each suit from Ace up to King. Cards in the waste pile are playable to tableau or foundations.

Scoring: +10 per card moved to a foundation.

Tips: With all cards visible, plan your same-color stacks carefully before drawing from the stock. Same-color building means more matching opportunities but fewer valid groups to move.`,
  settings: whiteheadSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  component: Whitehead,
};
