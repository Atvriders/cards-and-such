import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { TumbleweedState, TumbleweedAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TumbleweedGame } from "./Game.js";

const settings = {} as const;

export const tumbleweedPlugin: GamePlugin<TumbleweedState, TumbleweedAction, typeof settings> = {
  id: "tumbleweed",
  title: "Tumbleweed",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hex-grid territory game: place stacks based on line-of-sight.",
  howToPlay: `Tumbleweed is a modern abstract strategy game played on a hexagonal grid (radius 3, 37 hexes). You play dark blue; the bot plays light grey. Each starts with one piece on opposite edges.

On your turn, place a marker on any empty hex where you have line-of-sight (LOS) to at least one of your own pieces. LOS means: looking from the target hex in any of the 6 hex directions, the first piece you encounter is yours (unobstructed by enemy pieces). The stack height placed equals your LOS count from that hex.

You may also replace an opponent's hex if your LOS count from that position is strictly greater than their current stack height there. The new stack height equals your LOS count.

Highlighted hexes (green) show your legal placements — the number displayed inside is your LOS count.

The game ends when both players pass consecutively. The player controlling more hexes wins.

Pass when you have no useful moves. Since the bot plays greedily and the board fills up, timing your passes matters.

Strategy: build clusters to increase LOS from many hexes simultaneously. Pushing pieces into the center creates strong crossfire. High LOS = high stacks = harder for opponent to displace you.

Bot: greedy placement maximizing territory difference.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: TumbleweedGame,
};
