import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { KingsInTheCornerState, KingsInTheCornerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KingsInTheCorner } from "./KingsInTheCorner.js";

export const kingsInTheCornerSettings = {} as const;

export const kingsInTheCornerPlugin: GamePlugin<KingsInTheCornerState, KingsInTheCornerAction, typeof kingsInTheCornerSettings> = {
  id: "kings-in-the-corner",
  title: "Kings in the Corner",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Play your cards onto four tableau piles and the corner King piles. First out wins.",
  howToPlay: `Kings in the Corner is a multiplayer-style solitaire where you play against three computer opponents. Each player starts with seven cards. Four cards are dealt face-up onto the N, S, E, and W tableau piles. Four corner spots (NW, NE, SE, SW) start empty.

Your turn: First, draw one card from the stock. Then play as many cards as you can from your hand. Finally, click "End Turn" to pass to the next player.

Playing cards: Place a card from your hand onto any tableau or corner pile it can legally extend. Tableau builds down in alternating colors (red on black), like Klondike. Corner piles only accept Kings to start, then build down alternating colors on top.

Pile moves: You can also move an entire tableau or corner pile (as a stack) onto another pile if the bottom card of the moving pile can legally extend the target.

Winning: The first player to empty their hand wins. You win with a score of 100; if a bot empties their hand first, you score 0.

Bots play greedily: they draw, then play every legal card in sequence before ending their turn.`,
  settings: kingsInTheCornerSettings,
  initialState: (seed) => initialState(seed, {}),
  reducer,
  isTerminal,
  component: KingsInTheCorner,
};
