import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SevenSummitsQuizState, SevenSummitsQuizAction, SevenSummitsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SevenSummitsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const sevenSummitsQuizPlugin: GamePlugin<SevenSummitsQuizState, SevenSummitsQuizAction, typeof settings> = {
  id:"seven-summits-quiz", title:"Seven Summits Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Seven Summits — the highest mountain on each continent.",
  howToPlay:"Seven Summits Quiz tests your knowledge of mountaineering's most famous challenge: climbing the highest peak on each of the seven continents. Questions cover Everest in Asia, Aconcagua in South America, Denali in North America, Kilimanjaro in Africa, Elbrus in Europe, Vinson in Antarctica, and Carstensz Pyramid (or Kosciuszko in the Bass list) in Oceania. You'll be asked about elevations, locations, first ascents, and the differences between the Bass and Messner lists.\\n\\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\\n\\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 10, 20, or 30 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SevenSummitsQuizSettings),
  reducer,isTerminal,
  hint: (state: SevenSummitsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SevenSummitsQuizGame,
};
