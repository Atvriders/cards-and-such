import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CartographersDesertState, CartographersDesertAction, CartographersDesertSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CartographersDesertGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cartographersDesertPlugin: GamePlugin<CartographersDesertState, CartographersDesertAction, typeof settings> = {
  id: "cartographers-desert",
  title: "Cartographers: Desert",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Desert sheet for Cartographers; sandstorm and oasis scoring.",
  howToPlay: "Cartographers: Desert is a Cartographers sheet pack with arid biome scoring. Dice represent sandstorm cards revealing oases, dunes, ruins, and caravans.\n\nEach round, click Roll to draw a desert die (1-6). Click any empty cell to draw the revealed terrain. The pip becomes the terrain's value. Skip if you need a sandstorm to pass — but each skip is a lost map turn.\n\nScoring:\n- Each drawn cell scores its pip (1-6).\n- +5 per row (caravan route fully blazed).\n- +5 per column (waterway cleared).\n- +10 for fully mapped desert (oasis network complete).\n\n12 rolls available. Desert places high value on caravan routes — a single full row can score 5-30+ points. Strategy: bait dice toward long lines; a roll-1 cell still completes a bonus when placed correctly. A solid expedition scores 35-55; ambitious mapping reaches 65+. Cartographers: Desert turns the punishing landscape into a satisfying scoring puzzle. Sandstorms hide treasure beneath low pips; place wisely.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CartographersDesertSettings),
  reducer,
  isTerminal,
  component: CartographersDesertGame,
};
