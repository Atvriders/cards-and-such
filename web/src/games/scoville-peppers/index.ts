import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { ScovillePeppersState, ScovillePeppersAction, ScovillePeppersSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ScovillePeppersGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const scovillePeppersPlugin: GamePlugin<ScovillePeppersState, ScovillePeppersAction, typeof settings> = {
  id: "scoville-peppers",
  title: "Scoville Peppers",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pepper-planting card game. Harvest combos at market.",
  howToPlay: "Scoville Peppers compresses Scoville's market dynamics into ten quick turns. You start with $200 cash. Each turn pick: Invest $25 (1 Pepper plant), Save (5% interest), Hire a Grower for $45, or Trade a Pepper for a $30-50 farmer's-market price. After actions, each Pepper pays $5 spice income and each Grower earns $9 in farming wages. The mid-screen flavor describes pepper varieties: habanero, ghost, jalapeno. Score equals net worth on turn 10. The math: low cost-basis Peppers return 20%, Growers return 20%, saving 5%. Volume wins here: you can stack 6-8 peppers cheaply, plus 2-3 growers, for a steady engine. Pepper trades occasionally land at $50, beating cost-basis. Aim for $600-750. Pure save runs $325. Aggressive grower-only strategies cap near $550.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ScovillePeppersSettings),
  reducer,
  isTerminal,
  hint: (state: ScovillePeppersState): HintTarget | null => (state.phase === "choosing" ? { selector: '[data-testid="hint-target-scoville-peppers-primary"]', pulses: 3 } : null),
  component: ScovillePeppersGame,
};
