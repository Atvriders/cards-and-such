import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AmericanIdolQuizState, AmericanIdolQuizAction, AmericanIdolQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AmericanIdolQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const americanIdolQuizPlugin: GamePlugin<AmericanIdolQuizState, AmericanIdolQuizAction, typeof settings> = {
  id:"american-idol-quiz", title:"American Idol Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of American Idol contestants, judges, and famous moments.",
  howToPlay:"American Idol Quiz spans every season from Kelly Clarkson's 2002 win to today. Questions cover memorable contestants, iconic judges, viral moments, and the artists who broke through to massive stardom — like Carrie Underwood, Jennifer Hudson, Adam Lambert, and Phillip Phillips.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you watched it religiously on Fox, switched to ABC, or just remember Sanjaya, this quiz has Idol moments for everyone.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AmericanIdolQuizSettings),
  reducer,isTerminal,component:AmericanIdolQuizGame,
};
