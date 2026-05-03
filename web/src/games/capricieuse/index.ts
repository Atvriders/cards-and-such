import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { CapricieseState, CapricieseAction } from "./state.js";
import { initialState, reducer, isTerminal, capricieseRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Game as unknown as React.ComponentType<unknown> })));
export const capricieseSettings = {} as const;

export const capriciesePlugin: GamePlugin<CapricieseState, CapricieseAction, typeof capricieseSettings> = {
  id: "capricieuse",
  title: "Capricieuse",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck open solitaire — build alternating-color columns to 8 foundations.",
  howToPlay: `Capricieuse (French for "capricious") is a two-deck open solitaire with 12 wide tableau columns.

Setup: Two standard decks (104 cards) are shuffled and dealt face-up across 12 tableau columns — the first eight columns receive nine cards each, the last four receive eight cards each. Eight foundation piles start empty.

Foundations: Build each of the eight foundations upward from Ace to King in the same suit (four per deck copy). The first Ace of any suit starts one foundation; the second Ace starts a matching foundation. All 104 cards must reach the foundations to win.

Tableau building: Move cards or sequences of cards between tableau columns. A card may be placed on a column whose top card is one rank higher and the opposite color (same as Klondike — red on black, black on red). You may move a face-up sequence of consecutive alternating-color cards as a unit. Empty columns accept any card or sequence.

Goal: Transfer all 104 cards to the eight foundations.

Tips: With all cards visible from the start, plan long sequence moves to open up Aces and low cards. The two-deck format means you'll often have two cards of the same rank and suit competing — build carefully so neither gets buried.

Scoring: +10 per card on a foundation. Use Auto-move to sweep ready cards up.`,
  settings: capricieseSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state: CapricieseState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8"];
    const sources = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10", "t11", "t12"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, capricieseRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  component: Game,
};
