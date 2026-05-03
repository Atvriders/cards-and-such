import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KenoMiniState, KenoMiniAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const KenoMini = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.KenoMini as unknown as React.ComponentType<unknown> })));
export const kenoMiniSettings = {
  roundsPerSession: {
    kind: "number" as const,
    label: "Rounds per Session",
    min: 5, max: 50, step: 5, default: 15,
  },
  bet: {
    kind: "enum" as const,
    label: "Bet per Round",
    options: ["5", "10", "25"] as const,
    default: "10",
  },
  spotsToPlay: {
    kind: "enum" as const,
    label: "Spots to Pick",
    options: ["1", "2", "3", "4", "5"] as const,
    default: "5",
  },
} as const;

type KenoMiniSettingsType = SettingsOf<typeof kenoMiniSettings>;

export const kenoMiniPlugin: GamePlugin<KenoMiniState, KenoMiniAction, typeof kenoMiniSettings> = {
  id: "keno-mini",
  title: "Mini Keno",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pick 1-5 numbers from 1-40. House draws 10. Match more for bigger prizes.",
  howToPlay: `Mini Keno is a fast lottery-style casino game. The board shows 40 numbers. You pick 1 to 5 spots, then the house draws 10 numbers at random. The more of your picks that match, the bigger your payout.

How to play: Select how many spots (1-5) in settings. Click numbers on the board to pick them — green shows your selections. Once you've picked the required count, click Draw to pay your bet and reveal the 10 drawn numbers.

Hitting numbers: Matching picks light up in green. Unmatched picks show in red after the draw. Your payout depends on how many of your picks were drawn.

Pay table examples (5-spot): Hit 5/5 = 350x, 4/5 = 20x, 3/5 = 4x, 2/5 = 1x (break even). 1-spot: hit 1/1 = 3x.

Strategy: Fewer spots have a higher hit probability but smaller max payouts. 5-spot gives the best jackpot at 350x but the odds of all 5 matching 10 of 40 are low. 3-spot offers a reasonable balance of hit frequency and reward.

Score equals final bankroll at session end.`,
  settings: kenoMiniSettings,
  initialState: (seed: number, settings: KenoMiniSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".draw", pulses: 3 }; },
  component: KenoMini,
};
