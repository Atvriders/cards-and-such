import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { VerbalMemoryState, VerbalMemoryAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const VerbalMemory = /* @__PURE__ */ lazy(() => import("./VerbalMemory.js").then((mod) => ({ default: mod.VerbalMemory as unknown as React.ComponentType<unknown> })));
export const verbalMemorySettings = {
  lives: {
    kind: "enum" as const,
    label: "Lives",
    options: ["3", "5"] as const,
    default: "3" as const,
  },
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type VerbalMemorySettingsType = SettingsOf<typeof verbalMemorySettings>;

export const verbalMemoryPlugin: GamePlugin<VerbalMemoryState, VerbalMemoryAction, typeof verbalMemorySettings> = {
  id: "verbal-memory",
  title: "Verbal Memory",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Have you seen this word before? Remember every word shown and decide: SEEN or NEW.",
  howToPlay: `A word appears on screen. You must decide whether you have seen it earlier in this session or whether it is appearing for the first time. Press SEEN if you have seen it before, or NEW if it is the first time you are seeing it.

If you are correct, your score increases by one. If you are wrong, you lose a life. The game ends when you run out of lives or exhaust the word list.

Words are reused across the session, so a word you mark as NEW on round three may appear again later as a test of your memory. The longer you play without mistakes, the higher your score climbs.

Difficulty affects how many unique words appear in the list — easy uses 60 words, medium 80, and hard 100. With more words in circulation, it becomes harder to remember which ones you have already seen.

Tips: Pay close attention to each word as it appears — even if you think it is new, pause a moment to search your memory. Common short words are the trickiest because they feel familiar even when they are actually new. You cannot undo a choice, so take a brief moment before clicking. Building a mental rhythm helps — say each word quietly to yourself as it appears.`,
  settings: verbalMemorySettings,
  initialState: (seed: number, settings: VerbalMemorySettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".vm-btn", pulses: 3 }; },
  component: VerbalMemory,
};
