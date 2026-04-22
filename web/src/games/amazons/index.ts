import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { AmazonsState, AmazonsAction, AmazonsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Amazons } from "./Game.js";

const settings = {} as const;

export const amazonsPlugin: GamePlugin<AmazonsState, AmazonsAction, typeof settings> = {
  id: "amazons",
  title: "Game of Amazons",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Move your amazon queens and fire arrows to trap your opponent.",
  howToPlay: `The Game of Amazons is a strategic two-player game on a 10×10 board. You control four blue Amazon queens; the bot controls four red queens. The player who cannot make a complete move loses.

Each turn has two steps. First, click one of your queens (highlighted in green) to select it, then click a destination cell to move it — queens move exactly like chess queens (any distance, any of 8 directions, cannot jump over pieces or arrows). Second, from the queen's new position, shoot an arrow to any reachable cell in the same queen-movement pattern. The arrow lands on that cell and permanently blocks it.

Turns alternate. A player loses when none of their four queens can complete a move-and-shoot on their turn. The board fills up with arrow walls, progressively isolating each player's territory.

Bot strategy: the bot uses minimax at depth 2, evaluating positions by counting the number of legal move-and-shoot combinations available to each player. More mobility = better position.

Tips: early in the game, maneuver to control the center and limit the bot's queens. Once territories are separated by arrow walls, focus on maximising the free space your queens have — the player with more room almost always wins. Shooting arrows near the bot's queens is usually better than shooting toward your own queens.`,
  settings,
  initialState: (seed: number, s: AmazonsSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  component: Amazons,
};
