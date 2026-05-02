import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceCourtroomState, DiceCourtroomAction, DiceCourtroomSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceCourtroomGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceCourtroomPlugin: GamePlugin<DiceCourtroomState, DiceCourtroomAction, typeof settings> = {
  id:"dice-courtroom", title:"Dice Courtroom", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Defend your case with dice — sums of 18-25 win the jury, 10 rounds.",
  howToPlay:"Dice Courtroom is a 10-round drama mini where you defend a case before a jury of dice. The jury favors balanced, average sums — if your roll's pip-total lands inside the sweet spot of 18 to 25 (out of a possible 5-30), you win the round.\n\nYour round score equals 25 if your dice sum lands in [18, 25], 12 if in [13, 17] or [26, 28], and 0 otherwise. The expected sum of 5d6 is 17.5, so you'll often land in the lower ribbon. Roughly 45% of rolls land in the prime [18-25] window for a full 25-point verdict.\n\nPress Roll 5 Dice each round to plead your case, then Next to argue the next motion. After 10 rounds court is adjourned. Average runs land near 150-200 points. Expert lucky judgments push past 230. Calm, balanced rolls win the jury — wild extremes lose them.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceCourtroomSettings),
  reducer,
  isTerminal,
  hint: (state: DiceCourtroomState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "choose") return { selector: '[data-testid="hint-target-dice-courtroom-roll"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-dice-courtroom-next"]', pulses: 3 };
    return null;
  },
  component:DiceCourtroomGame,
};
