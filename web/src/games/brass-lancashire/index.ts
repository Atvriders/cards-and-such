import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { BrassLancashireState, BrassLancashireAction, BrassLancashireSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BrassLancashireGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const brassLancashirePlugin: GamePlugin<BrassLancashireState, BrassLancashireAction, typeof settings> = {
  id: "brass-lancashire",
  title: "Brass Lancashire",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cotton-and-coal Brass mini: 10 turns of Mills and Engineers in industrial England.",
  howToPlay: "Brass Lancashire condenses the original cotton-and-coal industrial network game into ten quick turns. You begin with $200 cash, no Mills, and no Engineers. Each turn, pick one action: Build a Mill for $40, Save your cash for 5% interest, Hire an Engineer for $60, or Sell a Mill back for a roughly $30-50 payout. After your action, every Mill earns $8 from cotton or coal output and every Engineer earns $12 from technical leadership. A Lancashire industrial event flavors the turn. Your final score is your net worth — cash plus the cost-basis value of your mills and engineers. Mills yield reliable income but tie up capital, engineers amplify yields but cost more, and saving is slow. Aim for a balanced industrial empire by turn 10 to dominate the Lancashire canals and railways.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BrassLancashireSettings),
  reducer,
  isTerminal,
  hint: (state: BrassLancashireState): HintTarget | null => (state.phase === "choosing" ? { selector: '[data-testid="hint-target-brass-lancashire-primary"]', pulses: 3 } : null),
  component: BrassLancashireGame,
};
