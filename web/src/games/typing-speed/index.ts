import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TypingSpeedState, TypingSpeedAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TypingSpeed = /* @__PURE__ */ lazy(() => import("./TypingSpeed.js").then((mod) => ({ default: mod.TypingSpeed as unknown as React.ComponentType<unknown> })));
export const typingSpeedSettings = {
  duration: {
    kind: "enum" as const,
    label: "Duration",
    options: ["30", "60", "120"] as const,
    default: "60" as const,
  },
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type TypingSpeedSettingsType = SettingsOf<typeof typingSpeedSettings>;

export const typingSpeedPlugin: GamePlugin<TypingSpeedState, TypingSpeedAction, typeof typingSpeedSettings> = {
  id: "typing-speed",
  title: "Typing Speed Test",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Type a paragraph as fast and accurately as you can. Score = WPM × accuracy.",
  howToPlay: `A paragraph of text appears on screen. Your job is to type it as quickly and accurately as possible before the timer runs out.

Click the text box and start typing immediately — the timer counts down the moment the game begins. Every character you type is highlighted green if correct or red if wrong. You cannot skip characters; the text must be entered in order.

Your score is calculated as WPM (words per minute) multiplied by your accuracy percentage. For example, 60 WPM with 90% accuracy gives a score of 54. Typing fast but sloppily will lower your score, so balance speed with precision.

Settings let you choose a duration of 30, 60, or 120 seconds and a difficulty level — easy paragraphs use common short words, medium adds variety, and hard includes more complex vocabulary and punctuation.

Tips: Keep your eyes on the reference paragraph, not the keyboard. If you make a mistake, resist the urge to delete and retype multiple words — a few wrong characters hurt accuracy less than lost time. Use all ten fingers and maintain a relaxed wrist position. The game ends automatically when time runs out or when you finish typing the entire paragraph.`,
  settings: typingSpeedSettings,
  initialState: (seed: number, settings: TypingSpeedSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: TypingSpeedState): HintTarget | null => {
    if (state.ended) return null;
    // Pulse the next-letter span (the first untyped char)
    const idx = state.typed.length;
    if (idx >= state.paragraph.length) return null;
    return { selector: `[data-testid="hint-target-typing-char-${idx}"]`, pulses: 3 };
  },
  component: TypingSpeed,
};
