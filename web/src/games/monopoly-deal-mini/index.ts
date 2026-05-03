import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { MonopolyDealMiniState, MonopolyDealMiniAction, MonopolyDealMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MonopolyDealMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MonopolyDealMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const monopolyDealMiniPlugin: GamePlugin<MonopolyDealMiniState, MonopolyDealMiniAction, typeof settings> = {
  id: "monopoly-deal-mini",
  title: "Monopoly Deal Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Card-game Monopoly. Play properties, charge rent, steal.",
  howToPlay: "Monopoly Deal Mini compresses Monopoly Deal into a ten-turn engine builder. You start with $200 cash. Each turn pick: Invest $30 to buy a Property, Save (5% interest), Hire a Tenant for $50 to occupy it, or Trade a Property for a $30-50 market sale. After actions, each Property pays $8 rent and each Tenant earns $12 from improvements. Mid-screen flavor describes deal-making, evictions, and steal cards. Score equals net worth at turn 10. The economics: Properties return 27% on basis (rent is profitable), Tenants return 24%, saving is 5%. Tenants amplify rent when you have the cash. Strategy: aim for 5+ Properties and 2 Tenants for $700-850. Trades work in late game when you need to free cash for one more Tenant. Pure property stacking caps near $620.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MonopolyDealMiniSettings),
  reducer,
  isTerminal,
  hint: (state: MonopolyDealMiniState): HintTarget | null => (state.phase === "choosing" ? { selector: '[data-testid="hint-target-monopoly-deal-mini-primary"]', pulses: 3 } : null),
  component: MonopolyDealMiniGame,
};
