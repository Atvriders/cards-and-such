import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MyHeroQuizState, MyHeroQuizAction, MyHeroQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MyHeroQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const myHeroQuizPlugin: GamePlugin<MyHeroQuizState, MyHeroQuizAction, typeof settings> = {
  id:"my-hero-quiz", title:"My Hero Academia Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your My Hero Academia knowledge: Quirks, U.A. High, Pro Heroes, and One For All.",
  howToPlay:`My Hero Academia Quiz tests your knowledge of Kohei Horikoshi's modern shonen smash hit. Questions cover Class 1-A, U.A. High School, the Pro Heroes, All Might, the symbol of peace, the League of Villains, All For One, the Hero Public Safety Commission, the Big Three, the Paranormal Liberation War, and the legacy of One For All from its origin to Deku.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers and timeouts earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move to the next question.

Choose 10 or 20 questions in Settings. Plus Ultra! Time to test how heroic your knowledge really is.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MyHeroQuizSettings),
  reducer,isTerminal,component:MyHeroQuizGame,
};
