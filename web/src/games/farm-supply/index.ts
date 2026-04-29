import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { FarmSupplyState, FarmSupplyAction, FarmSupplySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FarmSupplyGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const farmSupplyPlugin: GamePlugin<FarmSupplyState, FarmSupplyAction, typeof settings> = {
  id: "farm-supply",
  title: "Farm Supply Crash",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Farm supply and demand — crop prices crash with overproduction.",
  howToPlay: "Farm Supply Crash is a farm supply-demand distillation across ten turns. You start with $180 cash, no Crop cards, and no Tractor upgrades. Each turn, pick one action: Plant a Crop for $30, Save your cash for 5% interest, Buy a Tractor for $50, or Harvest a Crop for $25-45.\n\nAfter your action, every Crop earns $6 in market sales and every Tractor earns $10 in mechanized harvest. A market flavor event reflects supply gluts and shortages. Your final score is net worth — cash plus cost-basis value of crops and tractors. The Farmageddon genre rewards good timing; oversupply crashes prices, so vary your plantings. End with the fattest farm. Harvest moon, here we come.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FarmSupplySettings),
  reducer,
  isTerminal,
  component: FarmSupplyGame,
};
