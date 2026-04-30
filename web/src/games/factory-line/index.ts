import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { FactoryState, FactoryAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FactoryLine } from "./Game.js";

export const factoryLinePlugin = {
  id: "factory-line",
  title: "Factory Line",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Manage a factory floor over 24 shifts — fill production orders, upgrade machines, control quality and maximize profit!",
  howToPlay: `Factory Line puts you in charge of a small manufacturing plant for 24 production shifts. Your goal is to fulfill customer orders and maximize profit.

Each shift you receive a contract to produce a set number of units at an agreed price. Choose how many Workers (2–10, each costing $30/shift) and which Product to manufacture: Widgets (fast, cheap), Gears (medium), Circuits (slow, high value), or Springs (fastest, lowest value).

Click "Run Shift!" to simulate production. Each worker produces units based on the product type, but some units come out defective and are scrapped. Enable Quality Control ($40/shift extra) to cut defects significantly — worth it for high-value circuit production.

Upgrade your Machines ($100 each, up to 4 levels) to increase output per worker by 20% per level. Changing products mid-order resets to a new contract, so commit to a product for several shifts to maximize contract completion revenue.

Revenue only arrives when a full order is completed — so don't change products too frequently. Strategy: Upgrade machines early with Widgets to build cash, then switch to Circuits with QC for big contract payouts. Target $3000 by shift 24!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: FactoryState, action: FactoryAction) => FactoryState,
  isTerminal,
  component: FactoryLine,
} as unknown as GamePlugin;
