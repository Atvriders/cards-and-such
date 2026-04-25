import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type ChristmasCookieState, type ChristmasCookieAction } from "./state.js";
import { ChristmasCookieGame } from "./Game.js";

const settings = {
  pairs: {
    kind: "enum" as const,
    label: "Pairs",
    options: ["6", "8", "10"] as const,
    default: "8" as const,
  },
} as const;

export const christmasCookiePlugin: GamePlugin<ChristmasCookieState, ChristmasCookieAction, typeof settings> = {
  id: "christmas-cookie",
  title: "Christmas Cookie Match",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Flip holiday cookie cards to find matching pairs before your moves run out!",
  howToPlay: `Christmas Cookie Match is a festive memory card game. A grid of face-down cards hides pairs of holiday-themed cookies and symbols — gingerbread, stars, gift boxes, reindeer, snowmen, and more.

On each turn, click two cards to flip them face-up. If they show the same cookie, they stay matched and you earn 100 points plus a speed bonus. If they don't match, both cards flip back down after a short pause — try to remember where each symbol was!

The speed bonus rewards you for finding pairs quickly: the fewer total moves you make, the bigger the bonus. Plan ahead and use your memory to minimize wasted flips.

Match all pairs to complete the round. Your final score combines your match points and any bonuses earned along the way.

Settings let you choose 6, 8, or 10 pairs. Fewer pairs are great for a quick game; 10 pairs gives a full memory challenge. The board is randomly shuffled each game, so no two rounds are the same.`,
  settings,
  initialState,
  reducer,
  isTerminal,
  component: ChristmasCookieGame,
};
