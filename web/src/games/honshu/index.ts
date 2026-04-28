import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { HonshuState, HonshuAction, HonshuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HonshuGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const honshuBasePlugin: GamePlugin<HonshuState, HonshuAction, typeof settings> = {
  id: "honshu",
  title: "Honshu",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Japanese map-building tile placement with terrain layers.",
  howToPlay: `Honshu is a card-tile game where you build a Japanese landscape by laying tile-cards. In this version you place 18 random tiles on a 6x6 grid. Each tile shows one terrain: forest, water, town, factory, or field.

Click any empty cell to place the next tile.

Scoring (at end):
• Forest: +1 per tile in its largest connected forest group.
• Water: +2 per water tile adjacent to a town.
• Town: +3 per town tile (towns are universally good).
• Factory: +4 per factory if no two factories are adjacent (penalty −2 per adjacent factory pair).
• Field: +1 per field, +2 if isolated (no adjacent fields).

Towns are unconditionally valuable. Forests reward clusters. Factories reward spacing. Strategy: scatter factories, cluster forests, and tuck water beside towns. Mix it well and you'll easily clear 50 points.

After each placement the running tile count updates at the top. The game ends automatically when all 18 are placed and the final score is locked in.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HonshuSettings),
  reducer,
  isTerminal,
  component: HonshuGame,
};
