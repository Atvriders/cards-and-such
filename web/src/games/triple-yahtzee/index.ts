import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TripleYahtzeeState, TripleYahtzeeAction, TripleYahtzeeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TripleYahtzeeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const tripleYahtzeePlugin: GamePlugin<TripleYahtzeeState, TripleYahtzeeAction, typeof settings> = {
  id:"triple-yahtzee", title:"Triple Yahtzee", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Three-column Yahtzee with x1, x2, x3 multipliers. 12 rounds, columns auto-assigned.",
  howToPlay:"Triple Yahtzee is the three-column variant of Yahtzee where every roll is scored simultaneously across three independent columns multiplied by 1, 2, and 3 respectively. This compact version distills the gameplay into 12 single-roll rounds.\n\nEach round you roll five dice once. The system finds the best Yahtzee category for your dice (Yahtzee = 50, Four-of-a-kind = sum of all dice, Full House = 25, Small Straight = 30, Large Straight = 40, otherwise just sum of dice) and awards the value times the round's column multiplier (round 1-4 = ×1, 5-8 = ×2, 9-12 = ×3).\n\n12 rounds total. Average expected score: 250-400 points. A Yahtzee in a ×3 column is worth 150 points alone — a huge swing. Hope your big rolls fall in the late game when multipliers are highest!\n\nFast, mathematical, and rewarding to high-roll late.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TripleYahtzeeSettings),
  reducer,isTerminal,hint: (state): HintTarget | null => (state.phase === "done" ? null : { selector: '[data-testid="hint-target-triple-yahtzee-primary"]', pulses: 3 }), component:TripleYahtzeeGame,
};
