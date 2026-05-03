import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TuscanyEssentialState, TuscanyEssentialAction, TuscanyEssentialSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TuscanyEssentialGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TuscanyEssentialGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const tuscanyEssentialPlugin: GamePlugin<TuscanyEssentialState, TuscanyEssentialAction, typeof settings> = {
  id: "tuscany-essential",
  title: "Tuscany Essential",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Viticulture expansion — seasonal worker tracks and trade routes.",
  howToPlay: "Tuscany Essential extends the Viticulture wine estate game into ten quick turns. You begin with $200 cash, no Vine cards, and no Trade Routes. Each turn, pick one action: Buy a Vine for $40, Save your cash for 5% interest, Buy a Trade Route for $60, or Sell a Vine bottle to the market for a $30-50 payout. After your action, every Vine earns $8 in wine sales and every Trade Route earns $12 in barrel exports.\n\nA seasonal flavor event reflects spring, summer, fall, or winter. Your final score is net worth — cash plus the cost-basis value of vines and trade routes. Manage your cellar, plant rotating varietals, and use trade routes to push bottles into distant cities. Tuscan sunsets reward those who plan twelve months ahead.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TuscanyEssentialSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (state.phase === "choosing") return { selector: '[data-testid="hint-target-tuscany-essential-primary"]', pulses: 3 };
    if (state.phase === "resolved") return { selector: '[data-testid="hint-target-tuscany-essential-next"]', pulses: 3 };
    return null;
  },
  component: TuscanyEssentialGame,
};
