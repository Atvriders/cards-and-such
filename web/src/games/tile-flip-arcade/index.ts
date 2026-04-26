import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TileFlipArcadeState, TileFlipArcadeAction, TileFlipArcadeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TileFlipArcadeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const tileFlipArcadePlugin: GamePlugin<TileFlipArcadeState, TileFlipArcadeAction, typeof settings> = {
  id: "tile-flip-arcade", title: "Tile Flip Arcade", category: "arcade",
  players: { min:1, max:1, multiplayer:false },
  description: "Flip tiles at the perfect speed to reveal the pattern in minimum time!",
  howToPlay: `Tile Flip Arcade is a speed-based precision game. Each round, set the flip speed and trigger the tile sequence. Too fast and tiles blur; too slow and the pattern breaks. Find the sweet spot.\n\nAdjust the Speed slider, press Go!, and earn points based on how close your speed is to the target. The ideal speed changes each round.\n\n10 rounds per game. Feedback after each round tells you how far off you were. Use it to dial in your timing and maximize your total score!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as TileFlipArcadeSettings),
  reducer, isTerminal, component: TileFlipArcadeGame,
};
