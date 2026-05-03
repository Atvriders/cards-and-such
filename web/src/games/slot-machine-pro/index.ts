import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SlotMachineProState, SlotAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SlotMachineProGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SlotMachineProGame as unknown as React.ComponentType<unknown> })));
export const slotMachineProPlugin = {
  id: "slot-machine-pro",
  title: "Slot Machine Pro",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spin the reels across 30 spins — hit combos, trigger the jackpot, and double your credits!",
  howToPlay: `Slot Machine Pro gives you 100 starting credits and 30 spins to grow your bankroll. Set your bet (1–20 credits) and hit Spin to watch the reels tumble.

Seven symbols appear across three reels: Cherry, Lemon, Orange, Bell, Bar, Seven, and Wild. Rarer symbols pay bigger multipliers. Three Sevens trigger the Jackpot — a growing prize pool that starts at 200 credits and grows with each spin (10% of every bet added).

Winning combinations and their multipliers: Cherry (any position) returns your bet. Pairs of rare symbols (Bell, Bar, Seven) pay 2x. Three-of-a-kind multipliers range from 5x (Cherry) up to 50x (Seven). Wild symbols substitute for any other symbol in same-symbol combos.

The Jackpot resets to 200 after it is won, then begins growing again. Your bet size multiplies all payouts — betting big is riskier but the rewards scale proportionally.

The game ends when you run out of spins or credits hit zero. Your final score is based on ending credits relative to 200 (double your starting amount). Manage your bet size wisely — high bets can build fast but also drain quickly on bad streaks!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: SlotMachineProState, action: SlotAction) => SlotMachineProState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-slot-machine-pro-action"]', pulses: 3 }; },
  component: SlotMachineProGame,
} as unknown as GamePlugin;
