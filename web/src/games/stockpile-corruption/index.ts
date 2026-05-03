import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { StockpileCorruptionState, StockpileCorruptionAction, StockpileCorruptionSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const StockpileCorruptionGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.StockpileCorruptionGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const stockpileCorruptionPlugin: GamePlugin<StockpileCorruptionState, StockpileCorruptionAction, typeof settings> = {
  id: "stockpile-corruption",
  title: "Stockpile Continuing Corruption",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Stockpile expansion theme: 10 turns of insider trading with new event chaos.",
  howToPlay: "Stockpile Continuing Corruption packages the spirit of the Stockpile expansion into ten quick decision turns. You start with $200 cash, no shares, and no insiders. Each turn pick one action: Buy a Share for $40, Save your cash for 5% interest, Hire an Insider for $60, or Sell a Share back to the market for a roughly $30-50 random payout. After your action, every share pays an $8 dividend and every insider on payroll earns you $12 from corrupt tips. A market event line flavors the turn. Your final score is your net worth — cash plus the cost-basis value of your shares and insiders. Balance is key: shares pay reliably but tie up money, insiders amplify income but cost more upfront, and saving is safe but slow. Strong runs reach $700+ net worth; perfect runs near $1000.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as StockpileCorruptionSettings),
  reducer,
  isTerminal,
  hint: (state: StockpileCorruptionState): HintTarget | null => (state.phase === "choosing" ? { selector: '[data-testid="hint-target-stockpile-corruption-primary"]', pulses: 3 } : null),
  component: StockpileCorruptionGame,
};
