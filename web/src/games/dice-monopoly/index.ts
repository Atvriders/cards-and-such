import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceMonopolyState, DiceMonopolyAction, DiceMonopolySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceMonopolyGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceMonopolyPlugin: GamePlugin<DiceMonopolyState, DiceMonopolyAction, typeof settings> = {
  id:"dice-monopoly", title:"Dice Monopoly", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll a die and land on a 12-square board. Properties pay or charge.",
  howToPlay:`Dice Monopoly is a tiny board chase across 12 turns. You start at square 1 with 100 points in the bank. Each turn, press Roll to throw a single die and advance 1-6 squares (wrapping around the 12-square loop).

Each square has a fixed monetary effect:
— Square 1: +10
— Square 2: 0 (free parking)
— Square 3: +25 (premium block)
— Square 4: +5
— Square 5: -10 (rent!)
— Square 6: +15
— Square 7: 0
— Square 8: +30 (jackpot)
— Square 9: -5 (small rent)
— Square 10: +20
— Square 11: 0
— Square 12: +50 (mega bonus)

The board favors gains, so most games end above 100. Average ending scores fall in the 200-300 range. Land on square 8 or 12 multiple times for a sky-high finish; bouncing into 5 and 9 keeps you grounded.

12 turns total. Roll smart — well, roll lucky.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceMonopolySettings),
  reducer,
  isTerminal,
  hint: (state: DiceMonopolyState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-monopoly-roll"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-dice-monopoly-next"]', pulses: 3 };
    return null;
  },
  component:DiceMonopolyGame,
};
