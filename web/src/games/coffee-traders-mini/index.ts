import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { CoffeeTradersMiniState, CoffeeTradersMiniAction, CoffeeTradersMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CoffeeTradersMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CoffeeTradersMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const coffeeTradersMiniPlugin: GamePlugin<CoffeeTradersMiniState, CoffeeTradersMiniAction, typeof settings> = {
  id: "coffee-traders-mini",
  title: "Coffee Traders Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Coffee supply chain. Manage plantation, mill, export pipeline.",
  howToPlay: "Coffee Traders Mini is a ten-turn supply-chain game. You start with $200 cash. Each turn pick: Invest $35 to buy a bag of Beans, Save (5% interest at the bank), Hire a Roaster for $60 to scale your operation, or Trade a Bean to wholesale for a $30-50 market price. After actions, each Bean pays $8 supply-chain margin and each Roaster contributes $14 in roasting profit. Mid-screen flavor reflects the coffee industry's plantation-to-export reality. Score equals net worth on turn 10. The dynamics: Roasters return 23% on cost; Beans return 23%, with extra trade upside. Mix the two and you outpace pure saving. Aim for a 4-bean, 2-roaster operation by turn 10 to hit $700-800. Pure saving caps around $325. Aggressive roasting risks running out of cash before the engine spins up.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CoffeeTradersMiniSettings),
  reducer,
  isTerminal,
  hint: (state: CoffeeTradersMiniState): HintTarget | null => (state.phase === "choosing" ? { selector: '[data-testid="hint-target-coffee-traders-mini-primary"]', pulses: 3 } : null),
  component: CoffeeTradersMiniGame,
};
