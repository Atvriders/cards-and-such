import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { CenturyEasternWondersState, CenturyEasternWondersAction, CenturyEasternWondersSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CenturyEasternWondersGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CenturyEasternWondersGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const centuryEasternWondersPlugin: GamePlugin<CenturyEasternWondersState, CenturyEasternWondersAction, typeof settings> = {
  id: "century-eastern-wonders",
  title: "Century Eastern Wonders",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Maritime Century mini: 10 turns of Ships and Outposts on water routes.",
  howToPlay: "Century Eastern Wonders is the maritime sequel mini, distilled into ten quick turns of trade-route building. You start with $200 cash, no Ships, and no Outposts. Each turn, pick one action: Buy a Ship for $40, Save your cash for 5% interest, Build an Outpost for $60, or Sell a Ship back to the market for a roughly $30-50 payout. After your action, every Ship earns $8 from trade route revenue and every Outpost earns $12 from harbor dues. A maritime event flavors the turn. Your final score is your net worth — cash plus the cost-basis value of your ships and outposts. Ships yield reliable income but tie up capital, outposts amplify revenue but cost more upfront, and saving is slow but safe. Aim for a balanced fleet and outpost network by turn 10.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CenturyEasternWondersSettings),
  reducer,
  isTerminal,
  hint: (state: CenturyEasternWondersState): HintTarget | null => (state.phase === "choosing" ? { selector: '[data-testid="hint-target-century-eastern-wonders-primary"]', pulses: 3 } : null),
  component: CenturyEasternWondersGame,
};
