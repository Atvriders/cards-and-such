import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { AlhambraState, AlhambraAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Game } from "./Game.js";

export const alhambraSettings = {} as const;

export const alhambraPlugin: GamePlugin<AlhambraState, AlhambraAction, typeof alhambraSettings> = {
  id: "alhambra",
  title: "Alhambra",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck solitaire with ascending and descending foundations.",
  howToPlay: `Alhambra is played with two standard decks (104 cards) and features a dual-direction foundation system.

Setup: Deal 12 cards face-up into four tableau columns of three cards each. These are your playable reserve. The remaining 92 cards become the stock. Eight foundation piles sit ready — four build up from Ace to King (same suit), and four build down from King to Ace (same suit).

Stock and Waste: Click the stock to flip one card to the waste pile. The top card of the waste is always playable. You may recycle the waste back into the stock once.

Tableau building: Move a single card from the waste or tableau onto a tableau column if the card is a different color and differs by exactly one rank from the column's top card (either higher or lower). Empty tableau columns accept any card.

Foundations: Send cards from the waste or tableau to foundations whenever the rank and suit match. Up-foundations start with Aces; down-foundations start with Kings.

Goal: Move all 104 cards onto the eight foundations.

Scoring: +10 per card on any foundation. Use Auto-move to sweep all currently playable cards to foundations at once.`,
  settings: alhambraSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  component: Game,
};
