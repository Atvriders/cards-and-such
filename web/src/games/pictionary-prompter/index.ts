import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PictionaryState, PictionaryAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PictionaryPrompter } from "./Game.js";

export const pictionarySettings = {
  duration: {
    kind: "enum" as const,
    label: "Time Limit",
    options: ["60", "120", "180"] as const,
    default: "60" as const,
  },
  category: {
    kind: "enum" as const,
    label: "Category",
    options: ["mixed", "objects", "animals", "places", "actions", "food"] as const,
    default: "mixed" as const,
  },
} as const;

type PictionarySettingsType = SettingsOf<typeof pictionarySettings>;

export const pictionaryPlugin: GamePlugin<PictionaryState, PictionaryAction, typeof pictionarySettings> = {
  id: "pictionary-prompter",
  title: "Pictionary Prompter",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A drawing prompt generator — sketch each word for your team to guess before time runs out!",
  howToPlay: `Pictionary Prompter is a drawing party game generator. The app shows you a word or phrase that you must draw on paper while your team tries to guess what it is.

You may not write any letters, numbers, or words in your drawing. No verbal clues. Draw as fast as you can — if your team guesses correctly, press "Guessed!" to earn a point and move to the next prompt. If the prompt is too difficult, press "Skip" to move on without scoring.

Each prompt displays the category (objects, animals, places, actions, or food) and its difficulty level (easy, medium, or hard). Difficulty affects the complexity of the word — easy words are simple everyday objects, hard words may be obscure or multi-word phrases.

Choose Mixed category to get a blend of all prompt types. Select 60, 120, or 180 seconds to match your round length. Prompts are shuffled randomly each game.

Your score is the number of prompts your team correctly guessed. Compete against friends over multiple rounds, keeping a running tally, or try to beat your own personal best. Great for parties, classrooms, and family game nights!`,
  settings: pictionarySettings,
  initialState: (seed: number, settings: PictionarySettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".pictionary-btn", pulses: 3 }; },
  component: PictionaryPrompter,
};
