import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CartographersHeroesState, CartographersHeroesAction, CartographersHeroesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CartographersHeroesGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cartographersHeroesPlugin: GamePlugin<CartographersHeroesState, CartographersHeroesAction, typeof settings> = {
  id: "cartographers-heroes",
  title: "Cartographers Heroes",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cartographers with hero and monster card additions.",
  howToPlay: "Cartographers Heroes adds hero and monster cards to the base Cartographers map-drawing game. In this adaptation you draw your kingdom map on a 4x4 grid by rolling a single d6 each turn and assigning the value to a region. Click Roll, then click any empty cell to mark it with the rolled number. You may Skip if the roll doesn't suit. Each marked region adds its value to your kingdom's score. Strategy: complete rows and columns to claim hero bonuses (+5 each) and the full-map bonus (+10). The hero/monster theme adds tactical layers in classic play; here, line completion drives bonuses. Higher dice rolls produce premium regions, while lower rolls help close out partial lines. After 12 rolls the cartographer's map is final-scored. A solid Heroes score is 34-48 points; an exceptional map-builder reaches 65+. Each map starts from a fresh seeded dice sequence.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CartographersHeroesSettings),
  reducer,
  isTerminal,
  component: CartographersHeroesGame,
};
