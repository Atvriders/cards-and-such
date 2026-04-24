import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CountingState, CountingAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CountingBears } from "./Game.js";

export const countingBearsSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
} as const;

type CountingBearsSettings = SettingsOf<typeof countingBearsSettings>;

export const countingBearsPlugin: GamePlugin<CountingState, CountingAction, typeof countingBearsSettings> = {
  id: "counting-bears",
  title: "Counting Bears",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Count the colored bears on screen and pick the right number — great for early learners!",
  howToPlay: `Counting Bears is a colorful counting game for young children. In each round, a group of colored bears appears on screen. Your job is to count the bears of a specific color and tap the correct number from the choices below.

For example, if the question asks "How many red bears?" count only the red-colored bears — ignore the other colors. Then tap the button that shows the right number.

Each game has 5 rounds. You score 20 points for each correct answer, for a maximum of 100 points. Wrong answers score zero for that round, so look carefully before you tap!

Easy mode uses up to 6 bears total, making counting simple. Medium mode uses up to 10 bears, and Hard mode uses up to 15 bears spread across four colors — much trickier!

Take your time and count out loud to yourself. A good strategy is to point to each bear of the target color one by one as you count them. Have fun and sharpen those counting skills!`,
  settings: countingBearsSettings,
  initialState: (seed: number, settings: CountingBearsSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: CountingBears,
};
