import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BillboardHitsQuizState, BillboardHitsQuizAction, BillboardHitsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BillboardHitsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const billboardHitsQuizPlugin: GamePlugin<BillboardHitsQuizState, BillboardHitsQuizAction, typeof settings> = {
  id:"billboard-hits-quiz", title:"Billboard #1 Hits Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Billboard Hot 100 chart-toppers across decades.",
  howToPlay:"Billboard Hits Quiz dives into the songs that hit number one on the Hot 100 from the 1958 inception to today. Questions cover the longest-running chart toppers, the artists with the most #1s, surprise breakouts, viral chart climbers, and the controversies and milestones that shaped the chart.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. From Elvis Presley to Mariah Carey to Lil Nas X, this quiz spans every era of pop charts. Test your radio memory and hit the top of the leaderboard!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BillboardHitsQuizSettings),
  reducer,isTerminal,
  hint: (state: BillboardHitsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:BillboardHitsQuizGame,
};
