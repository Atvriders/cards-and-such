import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GoogleHistoryQuizState, GoogleHistoryQuizAction, GoogleHistoryQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GoogleHistoryQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const googleHistoryQuizPlugin: GamePlugin<GoogleHistoryQuizState, GoogleHistoryQuizAction, typeof settings> = {
  id:"google-history-quiz", title:"Google History Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Google/Alphabet's founding, products, and major moments.",
  howToPlay:"Google History Quiz spans the company's 1998 Stanford-PhD founding by Larry Page and Sergey Brin, the original PageRank algorithm, the rise of Gmail, Google Maps, YouTube acquisition, Android, Chrome, the Alphabet restructure, self-driving cars, and the AI/Bard/Gemini era.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. From Backrub to Gemini, this quiz tests every era of Google trivia. Don't be evil — get it all right!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GoogleHistoryQuizSettings),
  reducer,isTerminal,
  hint: (state: GoogleHistoryQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:GoogleHistoryQuizGame,
};
