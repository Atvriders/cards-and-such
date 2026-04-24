import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StoryState, StoryAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StoryBuilder } from "./Game.js";

export const storyBuilderSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["10", "20", "30"] as const,
    default: "20" as const,
  },
  mode: {
    kind: "enum" as const,
    label: "Mode",
    options: ["word", "sentence"] as const,
    default: "sentence" as const,
  },
} as const;

type StorySettingsType = SettingsOf<typeof storyBuilderSettings>;

export const storyBuilderPlugin: GamePlugin<StoryState, StoryAction, typeof storyBuilderSettings> = {
  id: "story-builder",
  title: "Story Builder",
  category: "board",
  players: { min: 2, max: 20, multiplayer: false },
  description: "Take turns adding to an absurd collaborative story!",
  howToPlay: `Story Builder is a collaborative storytelling game where each player adds one word or one sentence to an ever-growing story. The results are always unpredictable and frequently hilarious.

The game starts with a randomly chosen opening line — something like "Once upon a time, in a city made entirely of cheese." Each player then adds their contribution, one at a time.

Word mode: each player types exactly one word before passing the device. This creates wonderfully chaotic, grammar-defying stories.

Sentence mode: each player adds one complete sentence. This allows for a bit more narrative control, but the story still twists in wild directions as different imaginations collide.

How to play: pass the device around the group. The screen shows the story so far. Each player reads what has been written, types their addition, and taps Add. Then they pass the device to the next person without revealing what they typed until the next player reads it aloud.

After all rounds are used, the full story is displayed for the group to read aloud together. The funnier it gets, the more points you earn in spirit (the score just tracks contributions).`,
  settings: storyBuilderSettings,
  initialState: (seed: number, settings: StorySettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: StoryBuilder,
};
