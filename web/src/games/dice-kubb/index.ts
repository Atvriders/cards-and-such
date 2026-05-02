import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceKubbState, DiceKubbAction, DiceKubbSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceKubbGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceKubbPlugin: GamePlugin<DiceKubbState, DiceKubbAction, typeof settings> = {
  id: "dice-kubb",
  title: "Dice Kubb",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Kubb: knock down opposing kubbs and the king to win.',
  howToPlay: 'Dice Kubb is a real, dice-driven simulation. Kubb: knock down opposing kubbs and the king to win.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceKubbSettings),
  reducer,
  isTerminal,
  hint: (state: DiceKubbState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-kubb-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-kubb-next"]', pulses: 3 };
    return null;
  },
  component: DiceKubbGame,
};
