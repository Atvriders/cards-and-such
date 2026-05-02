import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceGridState, DiceGridAction, DiceGridSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceGridGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceGridPlugin: GamePlugin<DiceGridState, DiceGridAction, typeof settings> = {
  id:"dice-grid", title:"Dice Grid", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll dice to fill a 4×4 grid; 16 rolls.",
  howToPlay:"Dice Grid is a tiny dice strategy mini. Across 16 rounds you roll a single six-sided die and the rolled value is your score for that round. Tally up all 16 round scores at the end.\n\nThe expected value per roll is 3.5, so the average final score is 56. A great run pushes 70+; lucky streaks can break 80. Press Roll, see your value, press Next to advance. Simple, rhythmic, almost meditative.\n\nThe \"grid\" theme imagines you placing each rolled die into one cell of a 4×4 board — though in this minimum-rules version, the placement is automatic and your score is the cumulative sum of all 16 dice values. The strategy variants where you choose where to place are coming in expanded versions; this mini is the perfect bite-sized rhythm warm-up. Roll and roll!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceGridSettings),
  reducer,
  isTerminal,
  hint: (state: DiceGridState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-grid-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-grid-next"]', pulses: 3 };
    return null;
  },
  component:DiceGridGame,
};
