import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SalemTrialsQuizState, SalemTrialsQuizAction, SalemTrialsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SalemTrialsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const salemTrialsQuizPlugin: GamePlugin<SalemTrialsQuizState, SalemTrialsQuizAction, typeof settings> = {
  id:"salem-trials-quiz", title:"Salem Witch Trials Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the 1692 Salem Witch Trials.",
  howToPlay:"Salem Witch Trials Quiz dives into one of the most infamous episodes of mass hysteria in American history. In 1692, Salem Village in colonial Massachusetts erupted in accusations of witchcraft, leading to over 200 arrests and 20 executions. The trials shaped legal procedure, religious tolerance, and public memory for centuries.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. From Tituba to Cotton Mather, from spectral evidence to dunking ponds, the dark theater of Salem awaits!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SalemTrialsQuizSettings),
  reducer,isTerminal,
  hint: (state: SalemTrialsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SalemTrialsQuizGame,
};
