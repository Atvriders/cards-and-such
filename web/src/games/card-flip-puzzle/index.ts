import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CardFlipPuzzleState, CardFlipPuzzleAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardFlipPuzzle } from "./CardFlipPuzzle.js";

export const cardFlipPuzzlePlugin = {
  id: "card-flip-puzzle",
  title: "Card Flip Puzzle",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic memory card game — flip two cards to find matching pairs, clear all eight pairs to win!",
  howToPlay: `Card Flip Puzzle is a solo memory matching game played on a 4×4 grid of face-down cards. There are eight pairs of cards shuffled and placed face down. Your goal is to find all eight matching pairs using as few moves as possible.

On your turn, click any face-down card to flip it face up. Then click a second card. If the two cards show the same symbol they are a match — they stay face up and are removed from play. If they do not match they briefly stay visible for you to memorise, then flip back down when you tap any card to continue.

Every two-card reveal counts as one move. The game ends when all eight pairs are found. A perfect game takes exactly 8 moves (every pair found first try). Your score is 1000 minus 30 points for each move beyond 8 — so finishing in 10 moves scores 940, in 15 moves scores 790.

Study the positions of revealed cards as they flip back: that is how you reduce your move count from lucky guesses to sharp memory play!`,
  settings: {} as Record<string, never>,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: CardFlipPuzzle,
} as unknown as GamePlugin;
