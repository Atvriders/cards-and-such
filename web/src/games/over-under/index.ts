import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OverUnderState, OverUnderAction, OverUnderSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OverUnderGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const overUnderPlugin: GamePlugin<OverUnderState, OverUnderAction, typeof settings> = {
  id:"over-under", title:"Over Under", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Predict if two dice sum to over or under 7. 10 rounds; +10 per correct call.",
  howToPlay:`Over Under is a craps-style dice prediction game. Each round, you predict whether the sum of two six-sided dice will be Over 7 or Under 7. The dice are rolled, the sum is compared, and if you guessed correctly you score 10 points.

There are 10 rounds in a game. A sum of exactly 7 is a Push — neither side wins, and no points are awarded for that round. Since 7 is the most common sum (six combinations of dice, 16.7%), pushes are common and your maximum realistic score is around 80 points.

The probability of a sum greater than 7 is 41.7%; the probability of a sum less than 7 is also 41.7%. So neither Over nor Under is statistically smarter — it's pure 50/50 outside of pushes. Just call your direction, watch the dice, and see where the percentages land you. Average expected scores are around 40 points.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OverUnderSettings),
  reducer,isTerminal,component:OverUnderGame,
  hint: (state: OverUnderState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "predict") return { selector: '[data-testid="hint-target-overunder-predict"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-overunder-next"]', pulses: 3 };
    return null;
  },
};
