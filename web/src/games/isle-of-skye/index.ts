import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { IsleOfSkyeState, IsleOfSkyeAction, IsleOfSkyeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { IsleOfSkyeGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const isleOfSkyePlugin: GamePlugin<IsleOfSkyeState, IsleOfSkyeAction, typeof settings> = {
  id: "isle-of-skye",
  title: "Isle of Skye",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Scottish island tile-laying with rotating scoring objectives.",
  howToPlay: `Isle of Skye is a tile-auction game; this adaptation strips the auction and gives you 16 random tiles to place on a 6x6 grid. Each tile shows one feature: castle, scroll, sheep, lighthouse, or whisky.

The twist: each game randomly draws three of five scoring rules at start, and your placements are scored by all three at the end.

Scoring rules (sample selection per game):
• Castle: +3 per castle
• Scroll: +5 per scroll surrounded by 2+ different features
• Sheep: +2 per sheep adjacent to another sheep
• Lighthouse: +4 per lighthouse on the board's edge
• Whisky: +6 per pair of adjacent whisky tiles

Before each game read the active rules at the top of the screen. Click any empty cell to place the next tile. After 16 placements your scoreboard tallies all three rules.

A strong run aims for 35-50 points. Adapt — every game is different because the rules rotate.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as IsleOfSkyeSettings),
  reducer,
  isTerminal,
  component: IsleOfSkyeGame,
};
