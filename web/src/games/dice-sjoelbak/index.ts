import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceSjoelbakState, DiceSjoelbakAction, DiceSjoelbakSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceSjoelbakGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceSjoelbakPlugin: GamePlugin<DiceSjoelbakState, DiceSjoelbakAction, typeof settings> = {
  id: "dice-sjoelbak",
  title: "Dice Sjoelbak",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Sjoelbak: shuffle pucks into 4 numbered slots; bonuses for sets across all four.',
  howToPlay: 'Dice Sjoelbak is a real, dice-driven simulation. Sjoelbak: shuffle pucks into 4 numbered slots; bonuses for sets across all four.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceSjoelbakSettings),
  reducer,
  isTerminal,
  hint: (state: DiceSjoelbakState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-sjoelbak-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-sjoelbak-next"]', pulses: 3 };
    return null;
  },
  component: DiceSjoelbakGame,
};
