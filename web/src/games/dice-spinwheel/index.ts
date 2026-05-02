import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceSpinwheelState, DiceSpinwheelAction, DiceSpinwheelSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceSpinwheelGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceSpinwheelPlugin: GamePlugin<DiceSpinwheelState, DiceSpinwheelAction, typeof settings> = {
  id:"dice-spinwheel", title:"Dice Spinwheel", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Spin a dice wheel; bet on segments; 10 rounds.",
  howToPlay:"Dice Spinwheel is a dice-driven wheel-spinner. Across 10 rounds, a single die is rolled (1-6); rolling 4, 5, or 6 (the \"high\" segment) pays 20 points, while 1, 2, or 3 (the \"low\" segment) pays 0. There are no bets to place — the game spins for you.\n\nThe probability of hitting the high segment is exactly 50%, so expected per-roll value is 10 points and average final score across 10 rounds is 100 points. Lucky runs can break 160; cold runs may hit 40 or below.\n\nPress Roll to spin, then Next to advance. Quick, satisfying, and rhythmic — the wheel-spin in dice form. Maximum score is 200 (every roll high). A great filler between heavier games. Spin to win!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceSpinwheelSettings),
  reducer,
  isTerminal,
  hint: (state: DiceSpinwheelState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-spinwheel-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-spinwheel-next"]', pulses: 3 };
    return null;
  },
  component:DiceSpinwheelGame,
};
