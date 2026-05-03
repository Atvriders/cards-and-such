import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GlucksshausState, GlucksshausAction, GlucksshausSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GlucksshausGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const glucksshausPlugin: GamePlugin<GlucksshausState, GlucksshausAction, typeof settings> = {
  id:"glucksshaus", title:"Glücksshaus", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Medieval German 'house of fortune' betting on two-dice sums. 12 rounds.",
  howToPlay:"Glücksshaus (\"House of Luck\") is a medieval German dice game played on a board with numbered houses 2-12. Players bet which sum will appear when two dice are rolled; winning the sum means claiming the chips on that house.\n\nIn this 12-round single-player adaptation, you roll two dice each round. Each sum has a different payout reflecting Glücksshaus tradition: 7 = 0 (the \"King\" — house keeps), 2 = 25, 12 = 25, 3/11 = 20, 4/10 = 15, 5/9 = 10, 6/8 = 5.\n\n12 rounds total. The probability distribution skews toward 7 (the worthless house), so about 1 in 6 rolls scores nothing. Edge sums (2, 12) pay best but are rare (1/36 each). Average expected score: 80-160 points.\n\nA charming reconstruction of medieval gambling. The unique inverted-payout structure rewards the rare extremes — a 12 or 2 is doubly satisfying.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GlucksshausSettings),
  reducer,isTerminal,
  hint: (state: GlucksshausState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "roll") return { selector: '[data-testid="hint-target-glucksshaus-roll"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-glucksshaus-next"]', pulses: 3 };
    return null;
  },
  component:GlucksshausGame,
};
