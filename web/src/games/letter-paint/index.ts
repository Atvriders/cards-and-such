import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LetterPaintState, LetterPaintAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LetterPaintGame } from "./Game.js";

export const letterPaintSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["5", "10", "15"] as const,
    default: "10" as const,
  },
} as const;

type LetterPaintSettingsType = SettingsOf<typeof letterPaintSettings>;

export const letterPaintPlugin: GamePlugin<LetterPaintState, LetterPaintAction, typeof letterPaintSettings> = {
  id: "letter-paint",
  title: "Letter Paint",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Paint every cell containing the target letter on a 5×5 grid. Score points for accuracy and lose points for mistakes.",
  howToPlay: `Letter Paint challenges your visual search skills. Each round you receive a 5×5 grid filled with random capital letters and a single target letter shown above the grid.

Your job is to find and click every cell that contains the target letter — and only those cells. Clicking a cell toggles it between painted (highlighted) and unpainted, so you can correct mistakes before submitting.

When you are satisfied, press Submit to score the round. Each correctly painted target cell earns 10 points. Each incorrectly painted non-target cell costs 5 points. Missing a target cell also costs 5 points. A flawless round — every target painted, no wrong cells — earns a 20-point perfect bonus on top of the regular score.

The target letter appears in roughly one-quarter of the grid cells, but the exact count varies. A hint below the target letter tells you how many cells to look for.

After Submit, correct cells are highlighted green and wrong paints turn red so you can review your choices before moving to the next round.

Choose from 5, 10, or 15 rounds. More rounds give you a higher potential total score. The grid and target letter are randomly generated each round.

Tips: scan row by row rather than jumping around. The target count hint gives you a useful stopping point — once you have found that many cells, double-check before submitting.`,
  settings: letterPaintSettings,
  initialState: (seed: number, settings: LetterPaintSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: LetterPaintGame,
};
