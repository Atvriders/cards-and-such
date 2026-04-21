import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WhackAMoleState, WhackAMoleAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WhackAMole } from "./WhackAMole.js";

export const whackAMoleSettings = {
  duration: {
    kind: "enum" as const,
    label: "Duration",
    options: ["30", "60", "90"] as const,
    default: "60" as const,
  },
  grid: {
    kind: "enum" as const,
    label: "Grid Size",
    options: ["3", "4", "5"] as const,
    default: "3" as const,
  },
} as const;

type WhackAMoleSettingsType = SettingsOf<typeof whackAMoleSettings>;

export const whackAMolePlugin: GamePlugin<WhackAMoleState, WhackAMoleAction, typeof whackAMoleSettings> = {
  id: "whack-a-mole",
  title: "Whack-a-Mole",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Whack moles before they disappear. Score as many as possible before time runs out.",
  howToPlay: `Moles pop up from holes in the grid at random. Click or tap a mole as fast as you can before it ducks back underground. Each successful whack earns one point.

The game runs for a set duration — 30, 60, or 90 seconds — and your total score is the number of moles you whacked before time ran out. Moles stay visible for roughly 1 to 2 seconds. Miss a mole and it disappears on its own with no penalty, so focus on hitting as many as possible without wasting time on empty holes.

Grid size can be set to 3×3, 4×4, or 5×5. A larger grid means more holes and more moles can be active simultaneously, but they are spread further apart so it takes longer to scan the board. A smaller grid is easier to watch at once. Multiple moles can be active at the same time on any grid size.

Tips: Instead of chasing moles across the board, hover your mouse near the center of the grid and watch for movement in your peripheral vision. On a 3×3 grid, every hole is at most two moves from center. Stay calm — frantic clicking on empty holes wastes precious time. Try to click moles as soon as they appear rather than waiting until they are about to disappear.`,
  settings: whackAMoleSettings,
  initialState: (seed: number, settings: WhackAMoleSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: WhackAMole,
};
