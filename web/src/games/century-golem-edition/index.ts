import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { CenturyGolemEditionState, CenturyGolemEditionAction, CenturyGolemEditionSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CenturyGolemEditionGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CenturyGolemEditionGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const centuryGolemEditionPlugin: GamePlugin<CenturyGolemEditionState, CenturyGolemEditionAction, typeof settings> = {
  id: "century-golem-edition",
  title: "Century Golem Edition",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Crystal-and-golem Century reskin mini: 10 turns of Crystals and Apprentices.",
  howToPlay: "Century Golem Edition is the crystal-themed reskin of Spice Road, distilled into ten quick turns. You begin with $200 cash, no Crystals, and no Apprentices. Each turn, pick one action: Buy a Crystal card for $40, Save your cash for 5% interest, Hire an Apprentice for $60, or Sell a Crystal back to the market for a roughly $30-50 payout. After your action, every Crystal in your hand earns $8 from forge demand and every Apprentice on payroll earns $12 from golem-summoning fees. A crystal-trade event flavors the turn. Your final score is your net worth — cash plus the cost-basis value of your crystals and apprentices. Crystals yield steady income but tie up capital, apprentices amplify earnings but cost more, and saving is slow. Aim for a balanced workshop by turn 10 to top the leaderboards.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CenturyGolemEditionSettings),
  reducer,
  isTerminal,
  hint: (state: CenturyGolemEditionState): HintTarget | null => (state.phase === "choosing" ? { selector: '[data-testid="hint-target-century-golem-edition-primary"]', pulses: 3 } : null),
  component: CenturyGolemEditionGame,
};
