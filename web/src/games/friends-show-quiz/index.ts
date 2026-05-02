import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FriendsShowState, FriendsShowAction, FriendsShowSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FriendsShowQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const friendsShowQuizPlugin: GamePlugin<FriendsShowState, FriendsShowAction, typeof settings> = {
  id:"friends-show-quiz", title:"Friends Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Friends sitcom: Ross, Rachel, Monica, Chandler, Joey, Phoebe.",
  howToPlay:"Friends Quiz tests your knowledge of the iconic sitcom that ran from 1994 to 2004. Questions cover all six main characters — Ross, Rachel, Monica, Chandler, Joey, and Phoebe — along with the classic running gags, recurring guests, the apartments, Central Perk, and ten seasons of unforgettable moments.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you're a die-hard re-watcher or a casual fan, this quiz will be there for you!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FriendsShowSettings),
  reducer,isTerminal,
  hint: (state: FriendsShowState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:FriendsShowQuizGame,
};
