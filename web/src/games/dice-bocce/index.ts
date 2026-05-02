import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceBocceState, DiceBocceAction, DiceBocceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceBocceGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceBoccePlugin: GamePlugin<DiceBocceState, DiceBocceAction, typeof settings> = {
  id: "dice-bocce",
  title: "Dice Bocce",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Bocce: throw stones close to the jack; closest scores points each end.',
  howToPlay: 'Dice Bocce is a real, dice-driven simulation. Dice Bocce: throw stones close to the jack; closest scores points each end.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceBocceSettings),
  reducer,
  isTerminal,
  hint: (state: DiceBocceState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-bocce-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-bocce-next"]', pulses: 3 };
    return null;
  },
  component: DiceBocceGame,
};
