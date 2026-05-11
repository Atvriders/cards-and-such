import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { DealOrNoDealState, DondAction, DealOrNoDealSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DealOrNoDeal = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DealOrNoDeal as unknown as React.ComponentType<unknown> })));
const settings = {
  cases: {
    kind: "enum" as const,
    label: "Cases",
    options: ["26", "16"] as const,
    default: "26" as const,
  },
} as const;

export const dealOrNoDealPlugin: GamePlugin<DealOrNoDealState, DondAction, typeof settings> = {
  id: "deal-or-no-deal",
  title: "Deal or No Deal",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pick your briefcase, eliminate others, and decide whether to take the bank's growing cash offer.",
  howToPlay: `Deal or No Deal is a suspenseful case-selection game. At the start, 26 numbered briefcases (or 16 in short mode) are laid out, each hiding a dollar amount ranging from one cent to one million dollars. You pick one case as your own — it stays closed until the end.

Each round you must open a set number of the remaining cases, revealing what they held. Eliminating big amounts is bad news (they were not in your case); eliminating small amounts is good news. After every round the Bank makes you a cash offer based on the average of still-unopened cases and the round number. Early rounds bring low-ball offers; later rounds bring offers closer to the true average.

When the Bank offers, you choose: DEAL — accept the cash and walk away, or NO DEAL — reject the offer and keep eliminating cases. If you reach the final case without dealing, you may swap your original case for it or keep yours, then the case is opened.

Strategy tips: the bank's offer fraction rises each round, so patience pays if big amounts survive. Watch the remaining amounts on the board and trust your instincts. Accepting at the right moment versus holding out is the heart of the game. Your final score is the amount you win — the bank offer if you deal, or the value of your case at the end.`,
  settings,
  initialState: (seed: number, s: DealOrNoDealSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".dond-btn", pulses: 3 }; },
  component: DealOrNoDeal,
};
