import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LedZeppelinQuizState, LedZeppelinQuizAction, LedZeppelinQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LedZeppelinQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const ledZeppelinQuizPlugin: GamePlugin<LedZeppelinQuizState, LedZeppelinQuizAction, typeof settings> = {
  id:"led-zeppelin-quiz", title:"Led Zeppelin Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the heavy rock pioneers — Led Zeppelin's albums, songs, and lore.",
  howToPlay:`Led Zeppelin Quiz tests your knowledge of the legendary heavy rock pioneers. From Jimmy Page's Yardbirds origins through eight studio albums and the global stardom of Robert Plant, John Paul Jones, and the late John Bonham, you'll be quizzed on songs like 'Stairway to Heaven', 'Kashmir', and 'Whole Lotta Love', the Swan Song record label, and the band's enduring legacy.\n\nYou have 15 seconds per question. Each correct answer earns 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the correct answer is always revealed before you continue. Press Next to advance.\n\nChoose 10, 20, or 30 questions in Settings. Ramble on!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LedZeppelinQuizSettings),
  reducer,isTerminal,
  hint: (state: LedZeppelinQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:LedZeppelinQuizGame,
};
