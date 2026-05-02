import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceFivePinState, DiceFivePinAction, DiceFivePinSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceFivePinGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceFivePinPlugin: GamePlugin<DiceFivePinState, DiceFivePinAction, typeof settings> = {
  id: "dice-five-pin",
  title: "Dice Five-Pin Bowling",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Five-Pin Bowling: 2-die rolls = pins; classic strike/spare scoring across 10 frames.',
  howToPlay: 'Dice Five-Pin Bowling is a real, dice-driven simulation. Dice Five-Pin Bowling: 2-die rolls = pins; classic strike/spare scoring across 10 frames.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceFivePinSettings),
  reducer,
  isTerminal,
  hint: (state: DiceFivePinState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-five-pin-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-five-pin-next"]', pulses: 3 };
    return null;
  },
  component: DiceFivePinGame,
};
