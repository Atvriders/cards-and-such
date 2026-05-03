import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GuessFlagState, GuessFlagAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GuessTheFlag = /* @__PURE__ */ lazy(() => import("./GuessTheFlag.js").then((mod) => ({ default: mod.GuessTheFlag as unknown as React.ComponentType<unknown> })));
export const guessFlagSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["10", "25", "50"] as const,
    default: "10" as const,
  },
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
} as const;

type GuessFlagSettingsType = SettingsOf<typeof guessFlagSettings>;

export const guessFlagPlugin: GamePlugin<GuessFlagState, GuessFlagAction, typeof guessFlagSettings> = {
  id: "guess-the-flag",
  title: "Guess the Flag",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A flag quiz game — identify the country from its flag. Choose from 4 options each round.",
  howToPlay: `Guess the Flag is a geography quiz game. Each round displays an emoji flag and you must identify which country it belongs to by choosing one of four multiple-choice options.

Click the correct country name from the four choices shown. After you pick, the correct answer is revealed in green, and any wrong selection is highlighted in red. Click "Next Flag" (or "Finish" on the last round) to continue.

Difficulty controls which countries appear. Easy uses 15 widely-recognized flags from major world nations. Medium adds 30 countries including European and African nations with distinctive but less familiar flags. Hard includes all 40 countries — some with very similar-looking flags or flags from less commonly tested regions like Central Asia and small European microstates.

Score: 4 points per correct answer. A 10-round game is worth up to 40 points; a 25-round game up to 100; and a full 50-round marathon up to 200 points. There is no penalty for wrong answers.

Tips: study distinctive design elements — the maple leaf (Canada), the rising sun (Japan), the union jack pattern (UK and Australia), the crescent and star (Turkey, Pakistan). Be careful with similar-looking flags: Chad and Romania differ only subtly, and several Eastern European nations share the same three horizontal stripes in different orders.`,
  settings: guessFlagSettings,
  initialState: (seed: number, settings: GuessFlagSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-guess-the-flag-action"]', pulses: 3 }; },
  component: GuessTheFlag,
};
