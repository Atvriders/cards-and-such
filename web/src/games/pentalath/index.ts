import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { PentalathState, PentalathAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PentalathGame } from "./Game.js";

const settings = {} as const;

export const pentalathPlugin: GamePlugin<PentalathState, PentalathAction, typeof settings> = {
  id: "pentalath",
  title: "Pentalath",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hex-board stone game: connect 5, or capture by surrounding.",
  howToPlay: `Pentalath is a modern abstract strategy game played on a hexagonal board (radius 5, 61 hexes total). Two players take turns placing one stone of their color — you play dark, the bot plays light.

Primary win condition: be the first to form a connected group of 5 or more of your stones. On a hex grid, stones are connected if they share a hex edge (6-directional adjacency).

Capture rule: after you place a stone, if any of the opponent's groups are now completely surrounded — every empty hex adjacent to that group is now occupied by your stones — that group is removed from the board. Captured stones are gone permanently.

This capture mechanism prevents your own stones from being surrounded: position carefully to avoid your groups becoming isolated.

Strategic notes: The tension between building chains of 5 and avoiding encirclement makes Pentalath rich. A group of 3 or 4 stones that is nearly surrounded can be captured before it reaches 5. Spreading your stones too thin risks easy surround; clustering too tight makes them vulnerable to being enclosed.

Play across the board's natural axes to create groups that approach 5 in multiple directions simultaneously, forcing the bot to defend on more than one front.

Bot strategy: greedy placement — wins immediately if possible, blocks human near-wins (groups of 4), otherwise maximizes its largest connected group.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: PentalathGame,
};
