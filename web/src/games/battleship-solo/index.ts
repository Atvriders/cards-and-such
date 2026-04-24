import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BattleshipSoloState, BattleshipSoloAction, BattleshipSoloSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BattleshipSoloGame } from "./Game.js";

const battleshipSoloSettings = {
  gridSize: {
    kind: "number" as const,
    label: "Grid size",
    min: 8,
    max: 10,
    step: 2,
    default: 8,
  },
} as const;

type S = SettingsOf<typeof battleshipSoloSettings>;

export const battleshipSoloPlugin: GamePlugin<BattleshipSoloState, BattleshipSoloAction, typeof battleshipSoloSettings> = {
  id: "battleship-solo",
  title: "Battleship Solo",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hunt and sink all hidden ships before running out of shots.",
  howToPlay: `Battleship Solo places a fleet of ships on a hidden grid. Your goal is to locate and sink every ship before you exhaust your limited supply of shots.

Click any unrevealed cell to fire a shot at that coordinate. The result is shown immediately: a blue dot means a miss (open water); an orange flame means a hit (you struck part of a ship); a red explosion means you sunk that entire ship (all its cells are now revealed).

Ships are placed randomly at game start and never move. Ships are placed so that no two ships touch, even diagonally. Use the pattern of hits and misses to deduce where the rest of each ship lies.

On an 8×8 grid you have 35 shots to sink 4 ships (lengths 4, 3, 3, 2). On a 10×10 grid you have 50 shots to sink 6 ships (lengths 5, 4, 3, 3, 2, 2). If all ships are sunk before shots run out, you win. If shots reach zero with ships still afloat, you lose.

Score is 1000 minus 10 per shot fired, with a floor of 100. Efficient targeting (hunting by pattern, then tracking hits) will maximise your score.

Tip: After your first hit, fire at adjacent cells in a cross pattern to determine the ship's orientation, then continue along that axis.`,
  settings: battleshipSoloSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings as BattleshipSoloSettings),
  reducer,
  isTerminal,
  component: BattleshipSoloGame,
};
