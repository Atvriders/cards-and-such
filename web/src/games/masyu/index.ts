import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MasyuState, MasyuAction, MasyuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Masyu } from "./Game.js";

export const masyuSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy",
  },
} as const;

export const masyuPlugin: GamePlugin<MasyuState, MasyuAction, typeof masyuSettings> = {
  id: "masyu",
  title: "Masyu",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draw a single closed loop through all pearls, following the special rules for white and black pearls.",
  howToPlay: `Masyu is a loop-drawing puzzle played on a grid. Some cells contain pearls — either white (○) or black (●). Your goal is to draw a single closed loop that passes through orthogonally connected cells, obeying these rules.

Black pearls: the loop must turn exactly 90° at a black pearl, AND the loop must travel straight for at least one cell in both directions immediately after the turn (the cells immediately before and after the pearl on the path must not be turns).

White pearls: the loop must travel straight through a white pearl (no turn at the pearl itself), AND the loop must turn in one of the two cells immediately adjacent to the pearl on the path (either just before or just after).

The loop must pass through every pearl on the grid. It must form a single closed cycle with no dead ends, no branches, and no crossing.

Click between two adjacent cells to draw or erase a loop segment. The loop is shown in blue. When your loop satisfies all the pearl rules and forms a valid closed cycle, you win.

Strategy tip: start with black pearls — they force a tight constraint: turn here, straight for at least one cell before and after. Work outward from each pearl to deduce the loop's path.`,
  settings: masyuSettings,
  initialState: (seed: number, settings: MasyuSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Masyu,
};
