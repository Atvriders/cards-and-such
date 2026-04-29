import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AzulSintraState, AzulSintraAction, AzulSintraSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AzulSintraGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const azulSintraPlugin: GamePlugin<AzulSintraState, AzulSintraAction, typeof settings> = {
  id: "azul-sintra",
  title: "Azul: Stained Glass of Sintra",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Window-pane stained-glass column drafting; clear columns for big bonuses.",
  howToPlay: "Azul: Stained Glass of Sintra replaces the mosaic wall with stained-glass window panes. In this adaptation you place 14 random coloured glass tiles on a 5x5 personal window. Tile types are five glass colours: red, blue, green, yellow, and purple. Click any empty cell to place the next tile from the queue. Each placement scores 1 base point plus 1 for each adjacent same-colour tile. Strategy: build columns of matching colour because vertical and horizontal adjacency both contribute to scoring bonuses. Sintra historically rewards full columns by clearing them — in this adaptation we simply score adjacency densities. After 14 placements the game finalises with all adjacencies summed. A respectable score is 22-30; an exceptional column-builder can reach 38+. Random tile queues ensure each window puzzle is unique.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AzulSintraSettings),
  reducer,
  isTerminal,
  component: AzulSintraGame,
};
