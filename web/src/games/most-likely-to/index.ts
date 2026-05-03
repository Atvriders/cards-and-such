import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MLTState, MLTAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MostLikelyTo } from "./Game.js";

export const mostLikelyToSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["10", "20", "30"] as const,
    default: "20" as const,
  },
} as const;

type MLTSettingsType = SettingsOf<typeof mostLikelyToSettings>;

export const mostLikelyToPlugin: GamePlugin<MLTState, MLTAction, typeof mostLikelyToSettings> = {
  id: "most-likely-to",
  title: "Most Likely To",
  category: "cards",
  players: { min: 3, max: 20, multiplayer: false },
  description: "Point at the person most likely to — the classic group laugh game!",
  howToPlay: `Most Likely To is a hilarious group game that reveals what your friends really think about each other. A prompt appears on screen — something like "Most likely to survive a zombie apocalypse" — and every player simultaneously points at the person they think best fits the description.

The person with the most fingers pointing at them wins (or loses, depending on the prompt!) that round. Laugh, argue, and explain your votes before moving on.

How to play: prop up the device where everyone can see it. Read the prompt out loud. On a count of three, everyone points at once — no changing your vote! Count the fingers for each person. The one with the most votes is crowned "most likely to" for that prompt.

Optional: keep a tally. Give one point to whoever gets the most votes each round. The player with the most points at the end is officially the group's Most Likely To legend.

Choose 10, 20, or 30 prompts. Prompts are shuffled each game so repeat sessions always feel fresh. Works great as a dinner party warmup or after a few rounds of drinks.`,
  settings: mostLikelyToSettings,
  initialState: (seed: number, settings: MLTSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-most-likely-to-action"]', pulses: 3 }; },
  component: MostLikelyTo,
};
