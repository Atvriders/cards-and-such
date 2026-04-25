import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DicePyramidRollState, DicePyramidRollAction, DicePyramidRollSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DicePyramidRoll } from "./Game.js";

const dicePyramidRollSettings = {
  levels: { kind: "enum" as const, label: "Levels", options: ["3", "5"] as const, default: "3" as const },
} as const;

type DicePyramidRollSettingsType = SettingsOf<typeof dicePyramidRollSettings>;

export const dicePyramidRollPlugin: GamePlugin<DicePyramidRollState, DicePyramidRollAction, typeof dicePyramidRollSettings> = {
  id: "dice-pyramid-roll",
  title: "Dice Pyramid Roll",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll 6 dice and pick one per level of the pyramid. Each level needs a higher minimum value — can you top them all?",
  howToPlay: `Dice Pyramid Roll is a strategic dice selection game. Six dice are rolled and you must assign one die to each level of the pyramid, working from the bottom (easiest) to the top (hardest).

Level 1 needs a die showing 3 or more, Level 2 needs 6+, Level 3 needs 9+, and so on — but single dice max at 6. Higher levels are impossible unless you get lucky streaks.

Press Roll to see your six dice, then click the die you want to assign to the current level. If the chosen die meets or beats the target, you score 10 points plus the die value. If it falls short, you score 0 for that level.

Once assigned, a die is used up — you cannot reuse it. Choose wisely: save your high rolls for the harder levels!

Play 3 or 5 levels (set in Settings). Maximum score on a 3-level game is around 50 pts if you ace each level. It gets harder to top each level as the required minimum rises!`,
  settings: dicePyramidRollSettings,
  initialState: (seed: number, settings: DicePyramidRollSettingsType) => initialState(seed, settings as DicePyramidRollSettings),
  reducer,
  isTerminal,
  component: DicePyramidRoll,
};
