import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AppleHistoryQuizState, AppleHistoryQuizAction, AppleHistoryQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AppleHistoryQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const appleHistoryQuizPlugin: GamePlugin<AppleHistoryQuizState, AppleHistoryQuizAction, typeof settings> = {
  id:"apple-history-quiz", title:"Apple History Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Apple Inc.'s history, products, and milestones.",
  howToPlay:"Apple History Quiz tests your knowledge of one of the world's most valuable companies. Questions span Apple's founding by Steve Jobs, Steve Wozniak, and Ronald Wayne in 1976, the launch of the Apple I and Apple II, the Macintosh revolution, the dark NeXT years, the Jobs comeback, the iPod, the iPhone, and Apple's rise to a multi-trillion-dollar empire.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you're a Genius Bar regular or just love a good keynote, this quiz is for you!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AppleHistoryQuizSettings),
  reducer,isTerminal,
  hint: (state: AppleHistoryQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:AppleHistoryQuizGame,
};
