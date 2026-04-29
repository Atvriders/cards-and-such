import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CartographersMonstersState, CartographersMonstersAction, CartographersMonstersSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CartographersMonstersGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cartographersMonstersPlugin: GamePlugin<CartographersMonstersState, CartographersMonstersAction, typeof settings> = {
  id: "cartographers-monsters",
  title: "Cartographers: Monster Lairs",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cartographers add-on focused on monster-domain mapping.",
  howToPlay: "Cartographers: Monster Lairs is an add-on sheet pack featuring monster-domain drawing rules. In this adaptation you map a monster-haunted kingdom on a 4x4 grid by rolling a single d6 each turn and assigning the value to a domain cell. Click Roll, then click any empty cell to mark it with the rolled number. You may Skip a roll if it doesn't fit. Each marked cell adds its value to your kingdom's defence score. Strategy: complete rows and columns to fend off monster incursions (+5 each), plus +10 for fully mapping the kingdom. Monster lairs in classic play penalise undefended terrain; in this adaptation defence simply equals adjacency-completion bonuses. Higher rolls fortify the kingdom, lower rolls help finish partial lines. After 12 rolls the map is final-scored. A solid Monster Lairs score is 32-46 points; a thorough mapper reaches 60+.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CartographersMonstersSettings),
  reducer,
  isTerminal,
  component: CartographersMonstersGame,
};
