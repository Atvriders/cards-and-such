import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ZoolorettoTruckState, ZoolorettoTruckAction, ZoolorettoTruckSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ZoolorettoTruckGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const zoolorettoTruckPlugin: GamePlugin<ZoolorettoTruckState, ZoolorettoTruckAction, typeof settings> = {
  id: "zooloretto-truck",
  title: "Zooloretto Truck",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Animal delivery truck card drafting — fill enclosures without overcrowding.",
  howToPlay: "Zooloretto Truck condenses the animal delivery card drafting into ten quick turns. You begin with $200 cash, no Animal cards, and no Enclosure upgrades. Each turn, pick one action: Buy an Animal for $35, Save your cash for 5% interest, Buy an Enclosure for $55, or Sell an Animal back for $25-45.\n\nAfter your action, every Animal earns $7 from ticket sales and every Enclosure earns $11 from zoo memberships. A zookeeper event flavors each turn — sometimes a popular elephant arrives, sometimes a llama escapes. Your final score is net worth — cash plus the cost-basis value of animals and enclosures. Avoid overcrowding any one truck and keep the zoo profitable. The kids are watching.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ZoolorettoTruckSettings),
  reducer,
  isTerminal,
  component: ZoolorettoTruckGame,
};
