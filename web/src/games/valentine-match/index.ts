import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type ValentineMatchState, type ValentineMatchAction } from "./state.js";
import { ValentineMatchGame } from "./Game.js";

const settings = {
  pairs: {
    kind: "enum" as const,
    label: "Pairs",
    options: ["6", "8", "10"] as const,
    default: "8" as const,
  },
} as const;

export const valentineMatchPlugin: GamePlugin<ValentineMatchState, ValentineMatchAction, typeof settings> = {
  id: "valentine-match",
  title: "Valentine Match",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Find all matching Valentine pairs and build combos for bonus hearts!",
  howToPlay: `Valentine Match is a romantic memory card game with a combo system. A grid of face-down cards hides pairs of Valentine symbols — hearts, roses, chocolates, love letters, and more.

Click two cards to reveal them. If they match, they stay face-up and you earn 100 points plus a combo bonus — match pairs consecutively without a miss to build your combo multiplier. Each consecutive match increases the combo bonus by 50 points!

If the two revealed cards don't match, they flip back down after a short pause and your combo resets to zero. Try to memorize where each symbol was so you can plan your next move.

Match all pairs to complete the round. Your final score reflects both your accuracy and how well you maintained your combo streak.

Strategy: rather than flipping randomly, watch carefully when cards are revealed from a failed match — you now know exactly where those symbols are. Use this information to set up consecutive matches and maximize your combo multiplier.

Settings: choose 6, 8, or 10 pairs.`,
  settings,
  initialState,
  reducer,
  isTerminal,
  component: ValentineMatchGame,
};
