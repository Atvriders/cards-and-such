import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type AuctionState, type AuctionAction } from "./state.js";
const AuctionGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AuctionGame as unknown as React.ComponentType<unknown> })));
const settings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["5", "10", "15"] as const,
    default: "10" as const,
  },
} as const;

export const auctionGamePlugin: GamePlugin<AuctionState, AuctionAction, typeof settings> = {
  id: "auction-game",
  title: "Auction",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bid against an AI auctioneer to win valuable items and grow your fortune!",
  howToPlay: `Auction puts you in a lively auction house competing against an AI bidder. Each round a new item goes on the block — you can see its true value right away, so the challenge is deciding how aggressively to bid.

On your turn you may raise the current bid by $10, $25, $50, or $100. After each raise the AI decides whether to counter-bid or concede. If the AI's budget is tight or the item isn't worth the price, it backs down and you win. If the AI counter-bids, you must decide whether to raise again or pass.

Passing concedes the item to the AI at the current price — sometimes letting a mediocre item go is the smart play. You start with $1,000 and every item you win returns its true value in cash, so profitable buying grows your balance. Items you overpay for cut into your fortune.

At the end of all rounds your final cash balance is your score. Buy smart, avoid overpaying, and out-strategize the AI to reach the highest possible score!`,
  settings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".ag-raise-btn", pulses: 3 }; },
  component: AuctionGame,
};
