import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { KingdominoDuelState, KingdominoDuelAction, KingdominoDuelSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KingdominoDuelGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const kingdominoDuelPlugin: GamePlugin<KingdominoDuelState, KingdominoDuelAction, typeof settings> = {
  id: "kingdomino-duel",
  title: "Kingdomino Duel",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-player roll-and-write Kingdomino on a 4x4 personal grid.",
  howToPlay: "Kingdomino Duel is a two-player roll-and-write spin-off of Kingdomino. In this solo adaptation you place 12 random landscape tiles on a 4x4 personal grid. Tile types are: forest, wheat, mountain, and sea. Click any empty cell to place the next queued tile. Each placement scores 1 base point plus 1 per adjacent same-type tile. Strategy mirrors classic Kingdomino: keep matching terrains together to score adjacency bonuses, but on a tight 4x4 grid spacing matters more than ever. After 12 placements the score is finalised. With four types over 12 tiles each terrain averages three placements, allowing 1-2 strong clusters. Solid scores fall in the 22-30 range. Random tile draw ensures every duel is different. Try to build one major cluster of your most-frequent terrain — usually the dice draws give one terrain the edge.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as KingdominoDuelSettings),
  reducer,
  isTerminal,
  component: KingdominoDuelGame,
};
