import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TowerOfHanoiMiniState, TowerOfHanoiMiniAction, TowerOfHanoiMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TowerOfHanoiMiniGame } from "./Game.js";

const settings = {
  discs: { kind: "enum" as const, label: "Discs", options: ["3", "4", "5"] as const, default: "4" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const towerOfHanoiMiniPlugin: GamePlugin<TowerOfHanoiMiniState, TowerOfHanoiMiniAction, typeof settings> = {
  id: "tower-of-hanoi-mini",
  title: "Tower of Hanoi Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic 3-peg disc-stacking puzzle: move all discs from left peg to right peg.",
  howToPlay: `Tower of Hanoi Mini is the classic 3-peg disc puzzle dating to 1883 (Édouard Lucas). All discs start stacked largest-to-smallest on the left peg. Your goal is to rebuild the same stack on the right peg, moving one disc at a time and never placing a larger disc on a smaller one.

Tap a peg to pick up its top disc, then tap another peg to place it. The selected peg highlights to show your pickup. If the move is illegal, the disc returns to its origin.

Choose 3, 4, or 5 discs. The optimal solution requires exactly 2^N − 1 moves: 7 for three discs, 15 for four, 31 for five. Beating these targets is impossible; matching them is the goal.

Scoring rewards efficient play: 500 points minus 20 for every move beyond optimal, with a 50-point floor. A perfect solve scores 500.

Tips: always think recursively. To move N discs, first move N−1 to the spare peg, then move the bottom disc to the destination, then move N−1 from the spare to the destination. Patience and pattern recognition turn this from frustrating to elegant.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TowerOfHanoiMiniSettings),
  reducer,
  isTerminal,
  component: TowerOfHanoiMiniGame,
};
