import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceClutchState, DiceClutchAction, DiceClutchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceClutchGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceClutchPlugin: GamePlugin<DiceClutchState, DiceClutchAction, typeof settings> = {
  id:"dice-clutch", title:"Dice Clutch", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Eight rounds of two dice. The final round multiplies your score by 5x — pure clutch.",
  howToPlay:`Dice Clutch is an eight-round dice roller with a thrilling twist: the LAST round is worth 5x. Each round, you roll two six-sided dice. Your score for the round is the sum of the dice (2 to 12). For rounds 1 through 7, that sum is added to your running total directly.

For the eighth and final round (the CLUTCH round), the sum is multiplied by 5 before being added. So a final boxcars (6+6 = 12) yields a glorious 60 points; snake eyes (1+1 = 2) gives just 10. The clutch round can swing your final score by 50+ points.

Average per-round sum is 7; over the first seven rounds, expect about 49 points. The clutch round adds an expected 35 points, for a total around 84.

There are no decisions — just roll, watch, and pray for high numbers when the multiplier hits. The clutch is real!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceClutchSettings),
  reducer,
  isTerminal,
  hint: (state: DiceClutchState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-clutch-roll"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-dice-clutch-next"]', pulses: 3 };
    return null;
  },
  component:DiceClutchGame,
};
