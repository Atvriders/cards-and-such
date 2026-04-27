import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { XmenQuizState, XmenQuizAction, XmenQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { XmenQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const xmenQuizPlugin: GamePlugin<XmenQuizState, XmenQuizAction, typeof settings> = {
  id:"xmen-quiz", title:"X-Men Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your X-Men lore: mutants, Xavier's school, the Brotherhood, Magneto, and the Phoenix Saga.",
  howToPlay:`X-Men Quiz tests your knowledge of Marvel's mutant superhero family. Questions cover Charles Xavier's school, the original five (Cyclops, Marvel Girl, Beast, Iceman, Angel), the all-new all-different team (Wolverine, Storm, Nightcrawler, Colossus), Magneto and the Brotherhood, the Phoenix Force, the Sentinels, Days of Future Past, House of M, mutants in Krakoa, and decades of cosmic mutant drama.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers and timeouts earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move to the next question.

Choose 10 or 20 questions in Settings. Are you ready, mutant-maniac? It's time to step into the Danger Room.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as XmenQuizSettings),
  reducer,isTerminal,component:XmenQuizGame,
};
