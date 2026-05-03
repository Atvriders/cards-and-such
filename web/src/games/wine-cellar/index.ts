import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WineCellarState, WineCellarAction, WineCellarSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const WineCellarGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.WineCellarGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const wineCellarPlugin: GamePlugin<WineCellarState, WineCellarAction, typeof settings> = {
  id: "wine-cellar",
  title: "Wine Cellar Estate",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Wine estate card management — visitor cards drive seasonal actions.",
  howToPlay: "Wine Cellar Estate is a wine estate management distillation. Across ten turns you build a vineyard and bottle premium wines. You begin with $220 cash, no Vine cards, and no Cellar upgrades. Each turn, pick one action: Buy a Vine for $40, Save your cash for 5% interest, Buy a Cellar Upgrade for $60, or Sell a bottle for $30-50.\n\nAfter your action, every Vine earns $8 in grape sales and every Cellar earns $12 in vintage bottlings. A visitor flavor event reflects seasonal customers. Your final score is net worth — cash plus cost-basis value of vines and cellars. Plant carefully, age your wines, and end with the most prestigious estate in the valley. Cheers.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WineCellarSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (state.phase === "choosing") return { selector: '[data-testid="hint-target-wine-cellar-primary"]', pulses: 3 };
    if (state.phase === "resolved") return { selector: '[data-testid="hint-target-wine-cellar-next"]', pulses: 3 };
    return null;
  },
  component: WineCellarGame,
};
