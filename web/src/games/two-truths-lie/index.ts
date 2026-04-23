import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TTLState, TTLAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TwoTruthsLie } from "./Game.js";

export const twoTruthsLieSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["5", "10", "20"] as const,
    default: "10" as const,
  },
} as const;

type TTLSettingsType = SettingsOf<typeof twoTruthsLieSettings>;

export const twoTruthsLiePlugin: GamePlugin<TTLState, TTLAction, typeof twoTruthsLieSettings> = {
  id: "two-truths-lie",
  title: "Two Truths and a Lie",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three statements — two are true, one is a lie. Spot the lie for points!",
  howToPlay: `Two Truths and a Lie presents you with three statements in each round. Exactly two of the statements are true, and one is a deliberate lie. Your job is to figure out which statement is the lie.

Read all three statements carefully. Sometimes the lie is an obvious exaggeration or contradiction; other times it is subtle and requires you to recall specific facts. Click the statement you believe is the lie, then press the "That's the Lie!" button to lock in your answer.

After submitting, the game reveals which statement was the lie (shown in red) and which ones were true (shown in green). A brief explanation provides context so you can learn something even when you're wrong.

Correct identification earns you 100 points per round. There is no partial credit — you either spot the lie or you don't.

Play through 5, 10, or 20 rounds depending on your selected setting. The statements span a wide range of topics including science, history, nature, language, and pop culture. The order of statements is randomized each game so you cannot rely on position.

Final score and accuracy are shown at the end. Try to beat your record across different games!`,
  settings: twoTruthsLieSettings,
  initialState: (seed: number, settings: TTLSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: TwoTruthsLie,
};
