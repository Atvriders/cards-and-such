import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { BabetteState, BabetteAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Babette } from "./Babette.js";

export const babettePlugin: GamePlugin<BabetteState, BabetteAction, Record<string, never>> = {
  id: "babette",
  title: "Babette",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Single-deck patience with 10 columns — build four A→K foundations by suit.",
  howToPlay: `Babette is an elegant single-deck patience game. Your goal is to build all four foundation piles from Ace up to King, one pile per suit.

Deal: All 52 cards are dealt into 10 face-up columns of 5 cards each, with the remaining 2 cards forming a small hand pile you can draw through once.

Tableau rules: On the columns, you may move only the exposed top card. Place a card on another only if it is one rank lower and of the opposite color (red on black, black on red) — the classic alternating-color build. Empty columns accept any card.

Foundation: Move the top card of any column (or the current hand card) to a foundation whenever it fits — an Ace starts a foundation, then build upward in the same suit through King.

Hand: Click Draw to reveal the next hand card. You may play the revealed hand card onto any legal column spot or directly onto a foundation.

Scoring: +5 points for every card moved to a foundation. Maximum 260 points.

Tips: Uncover Aces quickly to open foundations. Use empty columns as temporary parking spots. Plan your alternating-color sequences carefully — the limited mobility makes every card placement matter.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: Babette,
};
