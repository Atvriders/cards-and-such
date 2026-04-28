import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BlackBoxMiniState, BlackBoxMiniAction, BlackBoxMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BlackBoxMiniGame } from "./Game.js";

const settings = {
  puzzles: { kind: "enum" as const, label: "Puzzles", options: ["8"] as const, default: "8" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const blackBoxMiniPlugin: GamePlugin<BlackBoxMiniState, BlackBoxMiniAction, typeof settings> = {
  id: "black-box-mini",
  title: "Black Box Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `Hidden-atom ray-deduction puzzles: pick where the atom hides in a 5x5 grid.`,
  howToPlay: `Black Box Mini is a solo adaptation of Eric Solomon's 1976 logic game. A single hidden "atom" sits in a 5×5 grid. Rays are fired from the edges; if a ray hits the atom directly, the result is "absorbed." If a ray passes adjacent to the atom (8-neighborhood), it deflects 90°. Otherwise it passes through to a marked exit.

In each puzzle you see 2–3 ray results (entry → exit, deflection direction, or absorbed) and must pick the atom's location from the candidate cells.

Eight puzzles per session, 100 points each (800 max).

Tips: an "absorbed" ray crashes head-on into the atom — the atom is somewhere along that ray's straight path. A "deflected" ray means the atom is adjacent to the path, on the side that would cause that exact deflection. A "passed through" ray (entry / exit unchanged direction) means no atom was within one cell of the entire path.

In real Black Box, players minimize the number of rays needed to deduce all atoms. Here you do it with the rays we give you.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BlackBoxMiniSettings),
  reducer,
  isTerminal,
  component: BlackBoxMiniGame,
};
