import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { FarmageddonCropsState, FarmageddonCropsAction, FarmageddonCropsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FarmageddonCropsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const farmageddonCropsPlugin: GamePlugin<FarmageddonCropsState, FarmageddonCropsAction, typeof settings> = {
  id: "farmageddon-crops",
  title: "Farmageddon Crops",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Crop supply and demand. Plant, sell, ride boom and bust.",
  howToPlay: "Farmageddon Crops is a ten-turn boom-bust crop trading game. You start with $200 cash, no crops, no farmhands. Each turn pick: Invest $30 (plant 1 crop), Save (5% interest), Hire a Farmhand for $50, or Trade a Crop for a $30-50 market price. After actions, each crop pays $6 yield income and each farmhand earns $10 from harvesting. Crops are cheap and small, so volume matters: a balanced diversified farm scales steadily. Mid-screen flavor describes weather and pest events. Score equals net worth at turn 10. Score targets: $400 minimum, $600 average, $800 great. Trades exploit market spikes when conditions favor you, while plant-and-hold farming rides steady yield income. Mix planting (low-cost volume) with farmhands (high-yield labor) for the best result.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FarmageddonCropsSettings),
  reducer,
  isTerminal,
  component: FarmageddonCropsGame,
};
