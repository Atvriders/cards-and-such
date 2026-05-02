import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceNinepinBowlState, DiceNinepinBowlAction, DiceNinepinBowlSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceNinepinBowlGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceNinepinBowlPlugin: GamePlugin<DiceNinepinBowlState, DiceNinepinBowlAction, typeof settings> = {
  id: "dice-ninepin-bowl",
  title: "Dice Nine-Pin Bowling",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Nine-Pin Bowling: 2-die rolls = pins; classic strike/spare scoring across 9 frames.',
  howToPlay: 'Dice Nine-Pin Bowling is a real, dice-driven simulation. Dice Nine-Pin Bowling: 2-die rolls = pins; classic strike/spare scoring across 9 frames.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceNinepinBowlSettings),
  reducer,
  isTerminal,
  hint: (state: DiceNinepinBowlState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-ninepin-bowl-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-ninepin-bowl-next"]', pulses: 3 };
    return null;
  },
  component: DiceNinepinBowlGame,
};
