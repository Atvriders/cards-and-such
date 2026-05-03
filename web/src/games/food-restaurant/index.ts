import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { FoodRestaurantState, FoodRestaurantAction, FoodRestaurantSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FoodRestaurantGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FoodRestaurantGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const foodRestaurantPlugin: GamePlugin<FoodRestaurantState, FoodRestaurantAction, typeof settings> = {
  id: "food-restaurant",
  title: "Food Chain Restaurant",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hire and train staff via card market — advertise vs rivals.",
  howToPlay: "Food Chain Restaurant is a restaurant-management distillation across ten turns. You start with $220 cash, no Staff cards, and no Restaurant upgrades. Each turn, pick one action: Hire a Staff for $40, Save your cash for 5% interest, Buy a Restaurant Upgrade for $60, or Lay off Staff for $30-50.\n\nAfter your action, every Staff earns $8 in productivity and every Upgrade earns $12 in customer satisfaction. A flavor event reflects ad campaigns and burger sales. Your final score is net worth — cash plus cost-basis value of staff and upgrades. The Food Chain Magnate genre rewards careful HR planning and bold marketing; this version compresses the brutal economic war into ten quick rounds. Burgers up.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FoodRestaurantSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (state.phase === "choosing") return { selector: '[data-testid="hint-target-food-restaurant-primary"]', pulses: 3 };
    if (state.phase === "resolved") return { selector: '[data-testid="hint-target-food-restaurant-next"]', pulses: 3 };
    return null;
  },
  component: FoodRestaurantGame,
};
