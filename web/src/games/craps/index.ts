import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CrapsState, CrapsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Craps = /* @__PURE__ */ lazy(() => import("./Craps.js").then((mod) => ({ default: mod.Craps as unknown as React.ComponentType<unknown> })));
export const crapsSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds per Session",
    options: ["5", "10", "20"] as const,
    default: "10",
  },
  betSize: {
    kind: "enum" as const,
    label: "Pass Line Bet",
    options: ["10", "25", "100"] as const,
    default: "25",
  },
} as const;

type CrapsSettingsType = SettingsOf<typeof crapsSettings>;

export const crapsPlugin: GamePlugin<CrapsState, CrapsAction, typeof crapsSettings> = {
  id: "craps",
  title: "Craps",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll two dice. Win on 7/11, lose on 2/3/12, or set a point and roll it again before a 7.",
  howToPlay: `Craps is one of the most exciting casino dice games. You're betting on the outcome of two six-sided dice.

Come-out roll: The first roll of a new round decides everything. Roll 7 or 11 and the Pass Line bet wins immediately (Natural!). Roll 2, 3, or 12 and the Pass Line loses (Craps!). Any other number — 4, 5, 6, 8, 9, or 10 — becomes the "point."

Point phase: Once a point is set, you keep rolling until one of two things happens. Roll the point number again and you win. Roll a 7 and you "seven out" — the Pass Line loses.

This simplified version only plays the Pass Line bet, the heart of craps. There are no odds bets, don't pass, come bets, or proposition bets — just pure Pass Line action.

The Pass Line has about a 49.3% chance of winning, making it one of the best bets in the casino with only a 1.41% house edge.

Settings: Choose rounds per session (5, 10, or 20) and bet size ($10, $25, $100). Score equals your final bankroll.`,
  settings: crapsSettings,
  initialState: (seed: number, settings: CrapsSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-craps-action"]', pulses: 3 }; },
  component: Craps,
};
