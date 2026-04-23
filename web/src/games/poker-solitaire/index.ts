import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal } from "./state.js";
import type { PokerSolitaireState, PokerSolitaireAction, PokerSolitaireSettings } from "./state.js";
import { PokerSolitaire } from "./PokerSolitaire.js";

const settings = {} as const;

export const pokerSolitairePlugin: GamePlugin<PokerSolitaireState, PokerSolitaireAction, typeof settings> = {
  id: "poker-solitaire",
  title: "Poker Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place 25 cards on a 5×5 grid and score all 10 lines as poker hands.",
  howToPlay: `Poker Solitaire (also called Poker Squares) turns the 5×5 grid into a scoring puzzle. A shuffled deck is prepared, then 25 cards are drawn one at a time. Each card must be placed immediately on the grid — you cannot move a card once placed.

After all 25 cards are placed, the game scores every row (5 rows) and every column (5 columns) as a five-card poker hand, giving 10 scored lines total.

British scoring system:
Royal Flush: 30 points. Straight Flush: 30 points. Four of a Kind: 16 points. Straight: 12 points. Full House: 10 points. Three of a Kind: 6 points. Flush: 5 points. Two Pair: 3 points. One Pair: 1 point. High Card: 0 points.

Maximum possible score is 300 points, though in practice scores above 80–100 are excellent.

Strategy tip: rows and columns share the same cards. Placing a card in a corner contributes to two lines at once. Try to build suited runs along one axis and pairs or sets along the other. Decide early whether to pursue flushes (which need all five of the same suit) or rely on pairs and straights.`,
  settings,
  initialState: (seed: number, _settings: PokerSolitaireSettings) => initialState(seed, _settings),
  reducer,
  isTerminal,
  component: PokerSolitaire,
};
