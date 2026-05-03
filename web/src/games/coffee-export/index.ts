import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CoffeeExportState, CoffeeExportAction, CoffeeExportSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CoffeeExportGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const coffeeExportPlugin: GamePlugin<CoffeeExportState, CoffeeExportAction, typeof settings> = {
  id: "coffee-export",
  title: "Coffee Export Chain",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Coffee supply chain — manage plantation, mill, export chain.",
  howToPlay: "Coffee Export Chain is a coffee supply-chain distillation across ten turns. You start with $200 cash, no Plantation cards, and no Mill upgrades. Each turn, pick one action: Buy a Plantation for $35, Save your cash for 5% interest, Buy a Mill for $55, or Sell beans for $25-45.\n\nAfter your action, every Plantation earns $7 in bean sales and every Mill earns $11 in roasted exports. A flavor event reflects shipping and weather. Your final score is net worth — cash plus cost-basis value of plantations and mills. The Coffee Traders genre rewards a balanced supply chain — too many plantations and not enough mills means rotting beans. Brew strong. Export bold.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CoffeeExportSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (state.phase === "choosing") return { selector: '[data-testid="hint-target-coffee-export-primary"]', pulses: 3 };
    if (state.phase === "resolved") return { selector: '[data-testid="hint-target-coffee-export-next"]', pulses: 3 };
    return null;
  },
  component: CoffeeExportGame,
};
