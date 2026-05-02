import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { StratFootballState, StratFootballAction, StratFootballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StratFootballGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const stratFootballPlugin: GamePlugin<StratFootballState, StratFootballAction, typeof settings> = {
  id: "strat-football",
  title: "Strat-O-Matic Football",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Strat-O-Matic Football: 4 quarters of dice-based plays; outscore the CPU.',
  howToPlay: 'Strat-O-Matic Football is a real, dice-driven simulation. Strat-O-Matic Football: 4 quarters of dice-based plays; outscore the CPU.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as StratFootballSettings),
  reducer,
  isTerminal,
  hint: (state: StratFootballState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-strat-football-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-strat-football-next"]', pulses: 3 };
    return null;
  },
  component: StratFootballGame,
};
