import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuizState, QuizAction, QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SportsTrivia } from "./Game.js";

const sportsTriviaSettings = {
  questions: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "20", "30"] as const,
    default: "10" as const,
  },
} as const;

type SportsTriviaSettingsType = SettingsOf<typeof sportsTriviaSettings>;

export const sportsTriviaPlugin: GamePlugin<QuizState, QuizAction, typeof sportsTriviaSettings> = {
  id: "sports-trivia",
  title: "Sports Trivia",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Prove your sports expertise — rules, records, champions, Olympic history, and iconic moments from dozens of sports worldwide.",
  howToPlay: `Sports Trivia challenges your knowledge of athletics across the globe. Questions span numerous sports including soccer, basketball, tennis, golf, American football, swimming, gymnastics, and the Olympics — covering rules, records, legendary athletes, and historic moments.

You have 15 seconds per question. A correct answer earns 100 base points plus a speed bonus of 10 points for every second remaining on the clock. Fast correct answers score much higher, so don't hesitate when you know the answer.

Click your chosen answer to highlight it, then press Submit. The correct answer lights up green and any wrong selection turns red. Press Next to move on.

Choose 10, 20, or 30 questions in Settings to set the length of your game. Questions are drawn randomly from a bank of 32 sports facts. Whether you're a diehard fan of one sport or a well-rounded athletics enthusiast, Sports Trivia will put your knowledge to the ultimate test.

Your final score and accuracy are displayed at the end — challenge yourself to beat your previous best and become the ultimate sports expert!`,
  settings: sportsTriviaSettings,
  initialState: (seed: number, settings: SportsTriviaSettingsType) => initialState(seed, settings as QuizSettings),
  reducer,
  isTerminal,
  component: SportsTrivia,
};
