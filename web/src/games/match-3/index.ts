import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Match3State, Match3Action } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Match3 } from "./Match3.js";

export const match3Settings = {
  moves: {
    kind: "enum" as const,
    label: "Move budget",
    options: ["30", "50", "100"] as const,
    default: "50" as const,
  },
  colors: {
    kind: "enum" as const,
    label: "Gem colors",
    options: ["5", "6", "7"] as const,
    default: "6" as const,
  },
} as const;

type Match3SettingsType = SettingsOf<typeof match3Settings>;

export const match3Plugin: GamePlugin<Match3State, Match3Action, typeof match3Settings> = {
  id: "match-3",
  title: "Gem Match",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Swap adjacent gems to match 3 or more in a row. Score as many points as possible before moves run out.",
  howToPlay: `Swap adjacent gems on the 8×8 grid to create horizontal or vertical lines of three or more matching colors. Click a gem to select it (it will glow), then click any gem directly next to it to attempt the swap. If the swap creates a match of 3 or more same-color gems, those gems disappear and award points. Gems above fall down to fill the gaps, and new random gems drop in from the top.

Scoring scales with match length: a 3-gem match scores 10 points, a 4-gem match scores 30, and a 5-gem match scores 100. Matches longer than 5 earn 50 bonus points per extra gem. Cascading chain reactions — where falling gems create new matches automatically — multiply the points for each successive cascade level.

If the swap does not create any match, it is rejected (no move is consumed). You start with a fixed number of moves (30, 50, or 100 depending on settings). The game ends when moves reach zero. Aim for long matches and chain reactions to maximize your score.

Settings: Gem Colors lets you choose 5, 6, or 7 colors — fewer colors mean more frequent matches. Move Budget controls how many swaps you get. Tip: look for spots where one swap sets up a cascade rather than just a simple 3-match.`,
  settings: match3Settings,
  initialState: (seed: number, settings: Match3SettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Match3,
};
