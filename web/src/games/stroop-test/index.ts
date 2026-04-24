import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StroopTestState, StroopTestAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StroopTest } from "./StroopTest.js";

export const stroopTestSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Cards",
    options: ["20", "30", "40"] as const,
    default: "20" as const,
  },
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type StroopTestSettingsType = SettingsOf<typeof stroopTestSettings>;

export const stroopTestPlugin: GamePlugin<StroopTestState, StroopTestAction, typeof stroopTestSettings> = {
  id: "stroop-test",
  title: "Stroop Test",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A word is shown in colored ink. Name the INK COLOR — not the word — as fast as you can.",
  howToPlay: `A color word (like "RED" or "GREEN") appears on screen, but the ink may be a completely different color. Your task is to identify the color of the ink, ignoring what the word says.

Click the button matching the ink color as quickly as possible. If the word says "RED" but is written in blue ink, you should click BLUE. This seems simple but is surprisingly difficult — your brain naturally wants to read the word.

Your score is based on both accuracy and speed. Answering quickly and correctly gives a higher score. Wrong answers lower your accuracy multiplier.

Difficulty controls how often congruent cards (word matches ink) appear. Easy has more congruent cards, which are easier. Hard uses almost entirely incongruent cards where the word and ink always conflict.

Tips: The key is to suppress the word-reading reflex and focus purely on visual color. Some people find it helps to defocus their eyes slightly so the word blurs. Others deliberately look at the edges of the letters rather than reading them. Practice builds the inhibition needed to override automatic word recognition. Slower but correct beats fast and wrong — each error costs more than the time you save by rushing.`,
  settings: stroopTestSettings,
  initialState: (seed: number, settings: StroopTestSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: StroopTest,
};
