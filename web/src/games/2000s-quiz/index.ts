import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TwoThousandsQuizState, TwoThousandsQuizAction, TwoThousandsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TwoThousandsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","15"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const twoThousandsQuizPlugin: GamePlugin<TwoThousandsQuizState, TwoThousandsQuizAction, typeof settings> = {
  id:"2000s-quiz", title:"2000s Y2K Era Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Harry Potter, iPods, 9/11, and reality TV — the 2000s.",
  howToPlay:`2000s Y2K Era Quiz covers the iPod and iPhone launches, Harry Potter, 9/11, the Iraq War, reality TV explosion, social media's birth, the housing bubble, and the rise of YouTube. The decade where the digital world arrived in earnest.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.

Choose 10 or 15 questions in Settings. Test your memory of the era, learn something along the way, and aim for a high score!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TwoThousandsQuizSettings),
  reducer,isTerminal,component:TwoThousandsQuizGame,
};
