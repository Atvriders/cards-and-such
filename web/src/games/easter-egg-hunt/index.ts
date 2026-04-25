import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type EasterEggHuntState, type EasterEggHuntAction } from "./state.js";
import { EasterEggHuntGame } from "./Game.js";

const settings = {
  eggs: {
    kind: "enum" as const,
    label: "Eggs",
    options: ["5", "8", "12"] as const,
    default: "8" as const,
  },
} as const;

export const easterEggHuntPlugin: GamePlugin<EasterEggHuntState, EasterEggHuntAction, typeof settings> = {
  id: "easter-egg-hunt",
  title: "Easter Egg Hunt",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Search the grassy field for hidden Easter eggs before you run out of guesses!",
  howToPlay: `Easter Egg Hunt is a hidden-object puzzle set on a 6×8 grid of grass tiles. Somewhere beneath the grass, colorful Easter eggs are waiting to be found.

Click any grass tile to search it. If an egg is hiding there, it reveals itself and you earn points — the fewer misses you have made so far, the bigger the reward. If no egg is there, you get a miss marker.

You have a limited number of misses before the hunt ends in failure. The exact number depends on how many eggs are hidden. Find all the eggs before running out of misses to win!

Strategy: there are no hints about where eggs are located — this is a game of deduction and memory. Pay attention to which areas you have already searched and try to cover the grid systematically rather than randomly to make the most of your remaining guesses.

Settings let you choose 5, 8, or 12 hidden eggs. Fewer eggs means a harder hunt (fewer targets in the same field); more eggs gives you more chances to score.`,
  settings,
  initialState,
  reducer,
  isTerminal,
  component: EasterEggHuntGame,
};
