import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChimpTestState, ChimpTestAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChimpTest } from "./ChimpTest.js";

export const chimpTestSettings = {
  startCount: {
    kind: "enum" as const,
    label: "Starting Numbers",
    options: ["4", "5", "6"] as const,
    default: "4" as const,
  },
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type ChimpTestSettingsType = SettingsOf<typeof chimpTestSettings>;

export const chimpTestPlugin: GamePlugin<ChimpTestState, ChimpTestAction, typeof chimpTestSettings> = {
  id: "chimp-test",
  title: "Chimp Test",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Numbered squares flash briefly. Click them in order from 1 to N. Chimps beat humans at this — can you?",
  howToPlay: `Numbered squares appear on a 5x5 grid. Study their positions, then click Start. The numbers are hidden and you must click the squares in ascending order — 1, then 2, then 3, and so on.

Each time you complete a round successfully, the next round adds more numbers to the grid, making it harder to remember. If you click the wrong square, you lose a life. You have three lives total — when they are gone the game ends.

Your score is the sum of numbers recalled correctly across all rounds. For example, completing a round with 4 numbers adds 4 to your score, then completing a 5-number round adds 5 more, giving a total of 9.

Difficulty affects how quickly the number count grows per round. Easy adds one number per round. Medium also adds one. Hard adds two per round, escalating the challenge faster.

Tips: Rather than memorizing abstract positions, try to trace a visual path through the numbers as they appear. Think of it as drawing a shape or route across the grid. Use spatial landmarks — corner squares, edge squares — as anchors. Research has shown that young chimpanzees can outperform adult humans on this exact task, so do not feel bad if you find it harder than expected!`,
  settings: chimpTestSettings,
  initialState: (seed: number, settings: ChimpTestSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: ChimpTest,
};
