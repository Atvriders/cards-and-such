import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AcquireHotelsState, AcquireHotelsAction, AcquireHotelsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AcquireHotelsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const acquireHotelsPlugin: GamePlugin<AcquireHotelsState, AcquireHotelsAction, typeof settings> = {
  id: "acquire-hotels",
  title: "Acquire Hotels",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hotel chain mergers. Invest in chains; largest holder wins.",
  howToPlay: "Acquire Hotels is a ten-turn investment race. You begin with $200 cash, no hotels, and no managers. Each turn pick: Invest $50 to buy a Hotel, Save (5% interest), Hire a Manager for $80, or Trade a Hotel back for a $30-50 random sale. After actions, each Hotel pays $12 dividend and each Manager earns $18 in operating profit. Mid-screen flavor describes mergers and acquisitions in flight. Score equals final net worth (cash plus hotel and manager cost-basis). The strategy: hotels return 24% on cost-basis per turn, managers return 22%, and saving 5% never beats either. The catch is upfront cost: early turns force you to save before you can scale. Aim for a 5-hotel, 2-manager portfolio by turn 10 for a $700+ score. Greedy strategies risk overspending. Quick saves with late investing rarely scale.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AcquireHotelsSettings),
  reducer,
  isTerminal,
  component: AcquireHotelsGame,
};
