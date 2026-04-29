import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceRussianPyramidState, DiceRussianPyramidStateAction, DiceRussianPyramidSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceRussianPyramidGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceRussianPyramidPlugin: GamePlugin<DiceRussianPyramidState, DiceRussianPyramidStateAction, typeof settings> = {
  id: "dice-russian-pyramid", title: "Dice Russian Pyramid", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "15-ball pyramid billiards; potting card sim.",
  howToPlay: "Dice Russian Pyramid models the 15-ball Russian pyramid billiards game, popular across Eastern Europe and Russia. Players pot 15 numbered balls from a central pyramid using the cue ball, with strict pocketing rules and heavy fouls for missed shots. The game emphasizes precise potting over the trick-shot flair of pool.\n\nThis dice-only sim mirrors the steady ball-counting rhythm. Each round (a shot), you Roll three dice. Outcomes: triple (perfect break — pot two balls +2 your team), sum >= 14 (clean pot +1 your team), sum <= 6 (foul, opp +1), otherwise miss with safe leave (no change).\n\nGame ends at 8 your points (8 balls potted from 15) or 12 rounds. Final score formula: 80 + (5 × your points) - (3 × opponent points) + (2 × rounds remaining if you finish early). Russian pyramid is unforgiving — fouls cost a point and ball. Average runs 110 to 150. Press Roll, Next.",
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceRussianPyramidSettings),
  reducer, isTerminal, component: DiceRussianPyramidGame,
};
