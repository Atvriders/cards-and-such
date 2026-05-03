import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SilentLettersState, SilentLettersAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SilentLetters = /* @__PURE__ */ lazy(() => import("./SilentLetters.js").then((mod) => ({ default: mod.SilentLetters as unknown as React.ComponentType<unknown> })));
export const silentLettersSettings = {
  questionCount: {
    kind: "enum" as const,
    label: "Questions",
    options: ["5", "10", "15"] as const,
    default: "10" as const,
  },
} as const;

type SilentLettersSettingsType = SettingsOf<typeof silentLettersSettings>;

export const silentLettersPlugin: GamePlugin<SilentLettersState, SilentLettersAction, typeof silentLettersSettings> = {
  id: "silent-letters",
  title: "Silent Letters",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spot the silent letter hidden in each word — the letter that is written but not spoken.",
  howToPlay: `Silent Letters is a spelling and phonics quiz. Each round presents a word in large letters and asks you to identify which letter is silent — written in the spelling but not pronounced when spoken aloud.

Four letter options are shown. Click or tap the one you believe is silent in that word. For example, in KNIGHT the K is silent; in THUMB the B is silent; in GNOME the G is silent. Correct answers highlight green; wrong ones turn red and the correct letter is revealed.

Each correct answer earns 10 points. Answer all questions to finish the game.

Settings let you choose 5, 10, or 15 questions per game.

Tips: Many words with KN start keep the K silent (KNIFE, KNEEL, KNOB). Words starting with WR have a silent W (WRITE, WRAP, WRIST). A B is often silent after M (THUMB, CLIMB, DEBT, DOUBT, SUBTLE). Silent L appears before consonants (CALM, PALM, HALF, CHALK, SALMON). The letter T is silent in many words ending in -TEN or -TLE (FASTEN, SOFTEN, CASTLE, LISTEN).`,
  settings: silentLettersSettings,
  initialState: (seed: number, settings: SilentLettersSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".sl-next", pulses: 3 }; },
  component: SilentLetters,
};
