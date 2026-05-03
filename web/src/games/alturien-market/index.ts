import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { AlturienMarketState, AlturienMarketAction, AlturienMarketSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AlturienMarketGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const alturienMarketPlugin: GamePlugin<AlturienMarketState, AlturienMarketAction, typeof settings> = {
  id: "alturien-market",
  title: "Alturien Market",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Commodity trading. Profit by anticipating demand spikes.",
  howToPlay: "Alturien Market is a ten-turn commodity-trading sim inspired by The Market of Alturien. You start with $200 cash. Each turn pick: Invest $35 (one Good), Save (5% interest), Hire a Trader for $60, or Trade a Good for a $30-50 random spot price. After actions, each Good pays $8 commodity income and each Trader earns $13 from commission spreads. Mid-screen flavor describes commodity demand spikes and futures markets. Score equals net worth on turn 10. The math: Goods return 23% on basis, Traders return 22%, saving is 5%. The trick: trades are randomized, sometimes you sell a Good for $50, sometimes $30, so anticipating spikes via flavor is illusory but the average profit pays off in volume. Aim for 5 Goods plus 2 Traders by turn 10 for $700-850. Slow runs cap at $325.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AlturienMarketSettings),
  reducer,
  isTerminal,
  hint: (state: AlturienMarketState): HintTarget | null => (state.phase === "choosing" ? { selector: '[data-testid="hint-target-alturien-market-primary"]', pulses: 3 } : null),
  component: AlturienMarketGame,
};
