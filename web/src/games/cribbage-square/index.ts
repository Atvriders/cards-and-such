import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CribbageSquareState, CribbageSquareAction, CribbageSquareSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CribbageSquare } from "./Game.js";

const settings = {} as const;

export const cribbageSquarePlugin: GamePlugin<CribbageSquareState, CribbageSquareAction, typeof settings> = {
  id: "cribbage-square",
  title: "Cribbage Square",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place 16 cards into a 4x4 grid. Score each row and column as a cribbage hand for 15s, pairs, and runs!",
  howToPlay: `Cribbage Square is a solitaire strategy game. Cards are dealt one at a time from a shuffled 52-card deck. You place each card into one of 16 cells arranged in a 4x4 grid.

After all 16 cards are placed, each of the four rows and four columns is scored as a 4-card cribbage hand. Scoring is based on three elements: combinations that sum to 15 (worth 2 points each), pairs and multiple pairs (2 points per pair), and runs of 3 or 4 consecutive ranks (worth 3 or 4 points respectively).

Plan carefully where to place each card — you want to maximize scoring combinations across all 8 lines simultaneously. A card that helps two or three rows and columns simultaneously is ideal.

The running score is shown as you play, so you can track how well your grid is shaping up. Live row and column scores update in real time.

A good game scores 20+ points. An excellent game can reach 40 or more. Every card placement counts — plan ahead!`,
  settings,
  initialState: (seed: number, s: typeof settings) => initialState(seed, s as CribbageSquareSettings),
  reducer, isTerminal, component: CribbageSquare,
};
