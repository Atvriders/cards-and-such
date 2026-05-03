import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { JumboYahtzeeState, JumboYahtzeeAction, JumboYahtzeeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { JumboYahtzeeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const jumboYahtzeePlugin: GamePlugin<JumboYahtzeeState, JumboYahtzeeAction, typeof settings> = {
  id:"jumbo-yahtzee", title:"Jumbo Yahtzee", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Six-dice Yahtzee variant with bonus for super-yahtzees. 10 rounds.",
  howToPlay:"Jumbo Yahtzee uses six dice instead of five, opening up larger combinations and bigger scores. This compact version distills the experience into 10 single-roll rounds with automatic best-category scoring.\n\nEach round you roll six dice once. The system finds the best Jumbo Yahtzee category: Six-of-a-kind = 80, Five-of-a-kind = 50, Four-of-a-kind = sum of all dice, Full House (3+3 or 3+2+pair) = 30, Long Straight (1-2-3-4-5-6) = 50, Short Straight (any 5-in-a-row from the six dice) = 40, Three-of-a-kind = sum, otherwise just dice sum.\n\n10 rounds total. Average expected score: 200-320 points. The 6-dice format makes Long Straights and 5/6-of-a-kind achievable without rerolls. A 6-of-a-kind on first roll is rare (1 in 7,776) but worth 80 points alone.\n\nMore dice, bigger upside, faster turns.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as JumboYahtzeeSettings),
  reducer,isTerminal,hint: (state): HintTarget | null => (state.phase === "done" ? null : { selector: '[data-testid="hint-target-jumbo-yahtzee-primary"]', pulses: 3 }), component:JumboYahtzeeGame,
};
