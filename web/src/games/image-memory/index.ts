import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ImageMemoryState, ImageMemoryAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ImageMemory } from "./Game.js";

export const imageMemorySettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Image Count",
    options: ["6", "8", "9"] as const,
    default: "6" as const,
  },
} as const;

type IMSettings = SettingsOf<typeof imageMemorySettings>;

export const imageMemoryPlugin: GamePlugin<ImageMemoryState, ImageMemoryAction, typeof imageMemorySettings> = {
  id: "image-memory",
  title: "Image Memory",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Icons flash one by one. Click them back in the exact order they appeared!",
  howToPlay: `Image Memory is a sequence-recall game that trains your visual and ordinal memory simultaneously. At the start of each round, a grid of emoji icons is shown, and each icon flashes in a specific order — one after another, highlighted with a golden glow.

Your job is to remember the order in which the icons lit up. Once all icons have flashed, the grid stays visible and it is your turn to click them in the exact same sequence they appeared. Click the first icon that flashed, then the second, and so on. Get one wrong and the round ends early, so focus carefully!

You earn points for each correct icon recalled, scaled by the difficulty. There are 5 rounds per game. After each round, the game shows you the correct order so you can learn from mistakes.

Choose your difficulty before starting: Easy uses 6 icons, Medium uses 8, and Hard uses 9. Larger grids mean more icons to track, which challenges both your visual memory and your ability to encode order.

Tips: As each icon flashes, say a short story aloud in your head — for example, "dog, pizza, star" — to create a narrative chain. Spatial positioning also helps: note where in the grid each icon is relative to the others. With practice, you will find you can hold surprisingly long sequences using these chunking techniques.`,
  settings: imageMemorySettings,
  initialState: (seed: number, settings: IMSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: ImageMemory,
};
