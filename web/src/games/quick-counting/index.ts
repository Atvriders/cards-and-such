import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuickCountingState, QCAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QuickCounting } from "./Game.js";

export const quickCountingSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
} as const;

type QCSettings = SettingsOf<typeof quickCountingSettings>;

export const quickCountingPlugin: GamePlugin<QuickCountingState, QCAction, typeof quickCountingSettings> = {
  id: "quick-counting",
  title: "Quick Counting",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Colored dots flash briefly. Count them fast and type the total!",
  howToPlay: `Quick Counting trains your numerosity — the brain's innate ability to rapidly estimate and count quantities without one-by-one tallying. Each round, a collection of colored dots flashes on screen for a brief moment. Your job is to count them and type the correct total before moving on.

On Easy difficulty, 1 to 20 dots appear for 1.5 seconds — enough time to count carefully if you are fast. On Medium, 20 to 50 dots appear for just 1 second, requiring subitizing and rapid estimation. On Hard, 50 to 100 dots show for only 0.7 seconds — at this level you must chunk and estimate rather than count individually.

Type your answer using the on-screen keypad and press OK. A correct answer scores 10 points. There are 10 rounds per game.

Tips: For small counts (under 10), your brain can subitize — recognize the quantity instantly without counting. For larger quantities, scan in rows or clusters: "I see two groups of 10 and one group of 7 — that's 27." With practice you will develop faster chunking strategies. The different emoji colors in the dot display are purely decorative — they do not encode any additional information about the count.`,
  settings: quickCountingSettings,
  initialState: (seed: number, settings: QCSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: QuickCountingState) => {
    if (state.phase === "done") return null;
    return { selector: ".qc-btn-primary", pulses: 3 };
  },
  component: QuickCounting,
};
