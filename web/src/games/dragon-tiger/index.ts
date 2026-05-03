import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DragonTigerState, DragonTigerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DragonTiger = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DragonTiger as unknown as React.ComponentType<unknown> })));
export const dragonTigerSettings = {
  handsPerSession: {
    kind: "number" as const,
    label: "Hands per Session",
    min: 5, max: 100, step: 5, default: 20,
  },
  bet: {
    kind: "enum" as const,
    label: "Bet per Hand",
    options: ["10", "25", "50"] as const,
    default: "10",
  },
} as const;

type DragonTigerSettingsType = SettingsOf<typeof dragonTigerSettings>;

export const dragonTigerPlugin: GamePlugin<DragonTigerState, DragonTigerAction, typeof dragonTigerSettings> = {
  id: "dragon-tiger",
  title: "Dragon Tiger",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Lightning-fast baccarat variant. One card each — highest wins.",
  howToPlay: `Dragon Tiger is one of the simplest and fastest casino card games. One card is dealt to Dragon and one to Tiger. The higher card wins. That's it.

How to play: Choose your bet — Dragon (1:1), Tiger (1:1), or Tie (8:1). Then press Deal. One card goes to Dragon, one to Tiger. Aces are highest (14), then King, Queen, Jack, 10 down to 2. The higher card wins.

Tie rules: On a tie, Dragon and Tiger bets push (you get half your bet back). The Tie bet pays a generous 8:1 — but ties only occur about 7.7% of the time on an 8-deck shoe.

Strategy: Dragon and Tiger bets are nearly 50/50 — house edge is only about 3.7%. The Tie bet, despite its 8:1 payout, carries a house edge over 30%, making it a poor long-term choice. Suit side bets and other variations are not offered here.

Speed: Because only two cards are dealt, hands complete in seconds. Sessions move extremely fast compared to blackjack or baccarat. Manage your bankroll carefully — swings compound quickly.

Score equals final bankroll.`,
  settings: dragonTigerSettings,
  initialState: (seed: number, settings: DragonTigerSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-dragon-tiger-action"]', pulses: 3 }; },
  component: DragonTiger,
};
