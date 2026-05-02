import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceStratArenaState, DiceStratArenaAction, DiceStratArenaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceStratArenaGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceStratArenaPlugin: GamePlugin<DiceStratArenaState, DiceStratArenaAction, typeof settings> = {
  id: "dice-strat-arena",
  title: "Dice Strat Arena",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Strat Arena: 4 quarters of dice-driven possessions; outscore the CPU.',
  howToPlay: 'Dice Strat Arena is a real, dice-driven simulation. Dice Strat Arena: 4 quarters of dice-driven possessions; outscore the CPU.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceStratArenaSettings),
  reducer,
  isTerminal,
  hint: (state: DiceStratArenaState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-strat-arena-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-strat-arena-next"]', pulses: 3 };
    return null;
  },
  component: DiceStratArenaGame,
};
