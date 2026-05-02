import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { InternetHistoryQuizState, InternetHistoryQuizAction, InternetHistoryQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { InternetHistoryQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const internetHistoryQuizPlugin: GamePlugin<InternetHistoryQuizState, InternetHistoryQuizAction, typeof settings> = {
  id:"internet-history-quiz", title:"Internet History Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of ARPANET, TCP/IP, the web, and how the internet was built.",
  howToPlay:"Internet History Quiz challenges you on the people and protocols that wired the world: the ARPANET pioneers, the invention of TCP/IP, the rise of the World Wide Web, the dot-com boom, search engines, social networks, and the modern era of mobile and cloud computing. Trace how a small DARPA experiment grew into a global network used by billions.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock \u2014 fast, accurate answers earn the highest score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you remember the dial-up days or grew up with broadband, this quiz will revisit the milestones that built the internet!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as InternetHistoryQuizSettings),
  reducer,isTerminal,
  hint: (state: InternetHistoryQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:InternetHistoryQuizGame,
};
