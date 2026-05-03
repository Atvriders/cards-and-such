import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { PanagramState, PanagramAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Panagram = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Panagram as unknown as React.ComponentType<unknown> })));
export const panagramSettings = {} as const;

export const panagramPlugin: GamePlugin<PanagramState, PanagramAction, typeof panagramSettings> = {
  id: "panagram",
  title: "Pangram",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Find all the words made from 7 letters — and discover the pangram that uses every letter!",
  howToPlay: `Pangram gives you a honeycomb of seven letters — one in the center (highlighted in yellow) and six surrounding it. Your goal is to find as many valid words as possible using only those seven letters.

Rules: every word must be at least 4 letters long and must contain the center letter. Letters may be reused as many times as you like within a single word.

Score depends on word length: 4-letter words score 1 point; longer words score one point per letter. Finding a pangram — a word that uses all seven letters at least once — earns double points plus a 7-point bonus.

Type letters using your keyboard or tap the hexagonal tiles on the grid. Use the backspace button (⌫) to delete the last letter. Press Enter or the Enter button to submit a word. Tap Shuffle to rearrange the outer tiles if that helps you spot new patterns.

When you are ready to end your session, click End to see your final score and the full list of words you found.

Tips: the center letter is your anchor — build outward from it. Short common words (4-5 letters) are easier to spot. Keep an eye out for prefixes and suffixes you can combine with the available letters.`,
  settings: panagramSettings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".panagram-btn", pulses: 3 }; },
  component: Panagram,
};
