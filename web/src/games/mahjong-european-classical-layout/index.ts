import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MahjongState, MahjongAction } from "../_shared/mahjongEngine.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MahjongEuropeanClassicalLayoutGame } from "./Game.js";

const settings = {} as const;

export const mahjongEuropeanClassicalLayoutPlugin: GamePlugin<MahjongState, MahjongAction, typeof settings> = {
  id: "mahjong-european-classical-layout",
  title: "Mahjong European Classical",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "EMA-style classical European layout.",
  howToPlay: "Clear all tiles by selecting matching pairs from the Mahjong European Classical arrangement. Tiles are arranged in a thematic pattern that defines which tiles are reachable first. EMA-style classical European layout. A tile is selectable (free) when no other tile sits directly on top of it AND at least one of its left or right edges is unobstructed by an adjacent tile on the same layer. Free tiles glow brighter; blocked tiles appear darker and cannot be clicked.\n\nClick one free tile to highlight it in blue, then click another free tile bearing the same face to remove the pair. If the second tile does not match, your selection switches to the new tile. As tiles are removed, previously buried or blocked tiles may become reachable — peeling back the layout in the right order is the heart of the game.\n\nYou win when every tile has been cleared. The game ends early if no matching pair remains among free tiles, so think before you commit. Scoring rewards both completion and efficiency: a full clear earns up to 10,000 points minus 50 per move; a deadlock yields partial credit proportional to tiles removed.",
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: MahjongEuropeanClassicalLayoutGame,
};
