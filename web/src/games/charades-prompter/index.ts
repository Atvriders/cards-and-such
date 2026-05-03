import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CharadesState, CharadesAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CharadesPrompter } from "./Game.js";

export const charadesSettings = {
  duration: {
    kind: "enum" as const,
    label: "Time Limit",
    options: ["60", "120", "180"] as const,
    default: "60" as const,
  },
  category: {
    kind: "enum" as const,
    label: "Category",
    options: ["mixed", "animals", "movies", "activities"] as const,
    default: "mixed" as const,
  },
} as const;

type CharadesSettingsType = SettingsOf<typeof charadesSettings>;

export const charadesPlugin: GamePlugin<CharadesState, CharadesAction, typeof charadesSettings> = {
  id: "charades-prompter",
  title: "Charades Prompter",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A party charades generator — act out or mime each prompt before time runs out!",
  howToPlay: `Charades Prompter is a party game generator. The app displays a word or phrase, and the actor must act it out, mime it, or describe it without saying the word itself.

In single-player mode, read each prompt silently and then act it out for a partner or group. The guesser(s) try to identify the word before you move on. If your team guesses correctly, press "Got it!" to score a point and advance to the next prompt. If the prompt is too hard or time is running out, press "Skip" to jump ahead.

Your score at the end is the number of prompts your team successfully completed. Skipped prompts do not count against your score.

Categories:
- Animals: creatures from the animal kingdom
- Movies: well-known films to act out
- Activities: hobbies, sports, and daily actions

Choose Mixed for a blend of all categories. Pick 60, 120, or 180 seconds to match your round length. Prompts are shuffled each session so no two games are the same.

House rules: No sounds, no mouthing words, no pointing at objects in the room. Pure mime and gesture only — or make up your own rules!`,
  settings: charadesSettings,
  initialState: (seed: number, settings: CharadesSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".charades-btn", pulses: 3 }; },
  component: CharadesPrompter,
};
