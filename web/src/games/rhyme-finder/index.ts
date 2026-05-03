import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RhymeFinderState, RhymeFinderAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RhymeFinder = /* @__PURE__ */ lazy(() => import("./RhymeFinder.js").then((mod) => ({ default: mod.RhymeFinder as unknown as React.ComponentType<unknown> })));
export const rhymeFinderSettings = {
  questionCount: {
    kind: "enum" as const,
    label: "Questions",
    options: ["5", "10", "15"] as const,
    default: "10" as const,
  },
} as const;

type RhymeFinderSettingsType = SettingsOf<typeof rhymeFinderSettings>;

export const rhymeFinderPlugin: GamePlugin<RhymeFinderState, RhymeFinderAction, typeof rhymeFinderSettings> = {
  id: "rhyme-finder",
  title: "Rhyme Finder",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pick the word that rhymes with the given prompt from four options.",
  howToPlay: `Rhyme Finder is a fast phonics quiz built around the sounds of words. Each round shows you a prompt word in large letters and asks you to identify which of the four options rhymes with it — that is, shares the same ending sound when spoken aloud.

Click or tap the word that rhymes. If you are correct the answer turns green; wrong answers flash red and the correct rhyme is revealed. Each correct pick earns 10 points. Answer all questions to complete the game.

Choose 5, 10, or 15 questions per round in the settings.

Tips: Focus on the vowel sound and any consonants following it — that is the part that must match for a rhyme. CAT rhymes with BAT because both end in the -AT sound, even though they look different at the start. Be careful not to choose words that look similar but sound different, like COUGH and ROUGH — visual similarity does not guarantee a rhyme. Say the words silently in your head to check the sounds, not just the letters.`,
  settings: rhymeFinderSettings,
  initialState: (seed: number, settings: RhymeFinderSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".rf-next", pulses: 3 }; },
  component: RhymeFinder,
};
