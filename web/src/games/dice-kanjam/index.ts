import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceKanjamState, DiceKanjamAction, DiceKanjamSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceKanjamGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceKanjamPlugin: GamePlugin<DiceKanjamState, DiceKanjamAction, typeof settings> = {
  id: "dice-kanjam",
  title: "Dice Kan Jam",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Kan Jam: throw to score; bag/ring on board = points; race to 21.',
  howToPlay: 'Dice Kan Jam is a real, dice-driven simulation. Dice Kan Jam: throw to score; bag/ring on board = points; race to 21.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceKanjamSettings),
  reducer,
  isTerminal,
  hint: (state: DiceKanjamState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-kanjam-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-kanjam-next"]', pulses: 3 };
    return null;
  },
  component: DiceKanjamGame,
};
