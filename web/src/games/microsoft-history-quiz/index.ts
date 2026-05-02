import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MicrosoftHistoryQuizState, MicrosoftHistoryQuizAction, MicrosoftHistoryQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MicrosoftHistoryQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const microsoftHistoryQuizPlugin: GamePlugin<MicrosoftHistoryQuizState, MicrosoftHistoryQuizAction, typeof settings> = {
  id:"microsoft-history-quiz", title:"Microsoft History Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Microsoft's founding, products, and major eras.",
  howToPlay:"Microsoft History Quiz spans the company's founding by Bill Gates and Paul Allen in 1975, BASIC for the Altair 8800, the IBM PC partnership and DOS, Windows, Office, the antitrust trial, the Ballmer years, the cloud pivot under Satya Nadella, the GitHub and LinkedIn acquisitions, and the rise of Azure and AI.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. From Clippy to Copilot, this quiz tests every era of Microsoft trivia.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MicrosoftHistoryQuizSettings),
  reducer,isTerminal,
  hint: (state: MicrosoftHistoryQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:MicrosoftHistoryQuizGame,
};
