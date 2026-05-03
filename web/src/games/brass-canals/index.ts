import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { BrassCanalsState, BrassCanalsAction, BrassCanalsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BrassCanalsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BrassCanalsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const brassCanalsPlugin: GamePlugin<BrassCanalsState, BrassCanalsAction, typeof settings> = {
  id: "brass-canals",
  title: "Brass Canals",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Industrial canal-building card economy. Cotton and coal industries.",
  howToPlay: "Brass Canals condenses Brass: Lancashire's industrial economy into ten quick decisions. You start with $200 cash, no mills, no engineers. Each turn pick: Invest $50 (1 Mill), Save (5% interest), Hire an Engineer for $80, or Trade a Mill for a $30-50 sale. After actions, each Mill pays $12 cotton/coal dividend and each Engineer earns $18 from canal-network operations. Mid-screen flavor describes canal-network expansion across industrial Lancashire. Score equals net worth at turn 10. The economy: Mills return 24% on basis, Engineers return 22%, saving lags both. With $200 starting cash you can afford only 4 actions before you need income, so the early game requires saving once or twice to prime. Strong runs reach $750-950 net worth, with 5 mills and 1-2 engineers. Aggressive engineering early can backfire if cash runs short.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BrassCanalsSettings),
  reducer,
  isTerminal,
  hint: (state: BrassCanalsState): HintTarget | null => (state.phase === "choosing" ? { selector: '[data-testid="hint-target-brass-canals-primary"]', pulses: 3 } : null),
  component: BrassCanalsGame,
};
