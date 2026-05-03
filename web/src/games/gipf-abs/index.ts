import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GipfAbsState, GipfAbsAction, GipfAbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GipfAbsGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const gipfAbsPlugin: GamePlugin<GipfAbsState, GipfAbsAction, typeof settings> = {
  id:"gipf-abs", title:"Gipf", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about GIPF, the eponymous mother game of the GIPF Project.",
  howToPlay:"GIPF Trivia is a ten-question quiz about GIPF, the eponymous Kris Burm abstract two-player strategy game and the first in the GIPF Project series. Played on a hexagonal board, each player has 18 pieces (15 ordinary plus three GIPF pieces, which count double). Players push pieces onto the board edges; lines that grow to four-in-a-row of one color are captured by that owner. The game ends when one player runs out of pieces in their reserve. Each question tests rules, the GIPF Project context, and strategy. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown. GIPF is a mind-bending strategy classic and the seed of an entire abstract series.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GipfAbsSettings),
  reducer,isTerminal,hint: (state: GipfAbsState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-gipf-abs-answer-0"]', pulses: 3 } : null, component:GipfAbsGame,
};
