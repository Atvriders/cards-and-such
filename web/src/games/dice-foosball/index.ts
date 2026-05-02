import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceFoosballState, DiceFoosballAction, DiceFoosballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceFoosballGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceFoosballPlugin: GamePlugin<DiceFoosballState, DiceFoosballAction, typeof settings> = {
  id: "dice-foosball",
  title: "Dice Foosball",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Foosball: play rallies to 10; first to target wins the match.',
  howToPlay: 'Dice Foosball is a real, dice-driven simulation. Dice Foosball: play rallies to 10; first to target wins the match.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceFoosballSettings),
  reducer,
  isTerminal,
  hint: (state: DiceFoosballState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-foosball-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-foosball-next"]', pulses: 3 };
    return null;
  },
  component: DiceFoosballGame,
};
