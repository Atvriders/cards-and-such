import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CartographersTundraState, CartographersTundraAction, CartographersTundraSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CartographersTundraGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cartographersTundraPlugin: GamePlugin<CartographersTundraState, CartographersTundraAction, typeof settings> = {
  id: "cartographers-tundra",
  title: "Cartographers: Tundra",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tundra map-pack flip-and-write; arctic terrain scoring rules.",
  howToPlay: "Cartographers: Tundra is a Cartographers map-pack featuring arctic exploration on a tundra-themed 4x4 grid, where dice represent terrain reveal cards.\n\nEach round, click Roll to draw a terrain die (1-6) showing a tundra biome (ice, snow, peak, lichen, etc.). Click any empty cell to draw that terrain there. The pip is the biome's score weight. Click Skip if you can't place the terrain advantageously.\n\nScoring:\n- Each placed terrain scores its pip (1-6).\n- +5 per fully drawn row (latitude band complete).\n- +5 per fully drawn column (longitudinal expedition).\n- +10 for fully mapped tundra (exploration complete).\n\n12 rolls total. Tundra has fewer hospitable zones than the base map, so skipping is more common — but every skip costs progress. Strategy: place high-pip terrain in cells that complete dual bonuses. A typical run scores 35-55; mastering the tundra reaches 65+. The Cartographers: Tundra add-on is for explorers who like quiet, methodical mapping over chaotic flips.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CartographersTundraSettings),
  reducer,
  isTerminal,
  component: CartographersTundraGame,
};
