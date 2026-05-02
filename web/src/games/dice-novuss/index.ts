import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceNovussState, DiceNovussAction, DiceNovussSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceNovussGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceNovussPlugin: GamePlugin<DiceNovussState, DiceNovussAction, typeof settings> = {
  id: "dice-novuss",
  title: "Dice Novuss",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Novuss: flick discs to score in scoring rings or pockets.',
  howToPlay: 'Dice Novuss is a real, dice-driven simulation. Dice Novuss: flick discs to score in scoring rings or pockets.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceNovussSettings),
  reducer,
  isTerminal,
  hint: (state: DiceNovussState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-novuss-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-novuss-next"]', pulses: 3 };
    return null;
  },
  component: DiceNovussGame,
};
