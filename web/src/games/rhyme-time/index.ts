import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RhymeTimeState, RhymeTimeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RhymeTime = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RhymeTime as unknown as React.ComponentType<unknown> })));
export const rhymeTimeSettings = {
  duration: {
    kind: "enum" as const,
    label: "Time Limit",
    options: ["30", "60"] as const,
    default: "30" as const,
  },
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
} as const;

type RhymeTimeSettingsType = SettingsOf<typeof rhymeTimeSettings>;

export const rhymeTimePlugin: GamePlugin<RhymeTimeState, RhymeTimeAction, typeof rhymeTimeSettings> = {
  id: "rhyme-time",
  title: "Rhyme Time",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Type as many rhyming words as possible before the timer runs out!",
  howToPlay: `Rhyme Time gives you a single prompt word and challenges you to type as many words as possible that rhyme with it before the timer expires.

A word counts as a valid rhyme if it ends with the same sound as the prompt word. The game displays the key ending (for example "…ight" for "night") to guide you. Type a word and press Enter or click Submit to lock it in. If the word is a recognized rhyme it appears in the found-words area.

Each correctly identified rhyme earns 10 points. Your score at the end is rhymes found × 10.

Difficulty controls the minimum word length required:
- Easy: rhymes of 2 or more letters accepted
- Medium: rhymes of 3 or more letters
- Hard: rhymes of 4 or more letters (challenging!)

You cannot use the prompt word itself, and you cannot reuse a rhyme you've already found. The clock runs in real time, so think fast. Some prompt words have many rhymes; try to think in patterns (cat → bat → hat → mat…).

Choose 30 or 60 seconds in settings. The prompt word is randomly selected each session.`,
  settings: rhymeTimeSettings,
  initialState: (seed: number, settings: RhymeTimeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-rhyme-time-action"]', pulses: 3 }; },
  component: RhymeTime,
};
