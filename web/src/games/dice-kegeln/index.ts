import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceKegelnState, DiceKegelnAction, DiceKegelnSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceKegelnGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceKegelnPlugin: GamePlugin<DiceKegelnState, DiceKegelnAction, typeof settings> = {
  id: "dice-kegeln",
  title: "Dice Kegeln",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Kegeln: 2-die rolls = pins; classic strike/spare scoring across 8 frames.',
  howToPlay: 'Dice Kegeln is a real, dice-driven simulation. Dice Kegeln: 2-die rolls = pins; classic strike/spare scoring across 8 frames.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceKegelnSettings),
  reducer,
  isTerminal,
  hint: (state: DiceKegelnState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-kegeln-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-kegeln-next"]', pulses: 3 };
    return null;
  },
  component: DiceKegelnGame,
};
