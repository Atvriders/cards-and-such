import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Nineteen70sQuizState, Nineteen70sQuizAction, Nineteen70sQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Nineteen70sQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","15"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const nineteen70sQuizPlugin: GamePlugin<Nineteen70sQuizState, Nineteen70sQuizAction, typeof settings> = {
  id:"1970s-quiz", title:"1970s Disco Era Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Disco, Watergate, Star Wars — test your 1970s knowledge.",
  howToPlay:`1970s Disco Era Quiz covers Watergate, the end of Vietnam, disco fever, Star Wars, the rise of punk rock, the Cold War detente, the women's movement, and iconic TV like M*A*S*H. From bell bottoms to platform shoes, the seventies had style.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.

Choose 10 or 15 questions in Settings. Test your memory of the era, learn something along the way, and aim for a high score!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Nineteen70sQuizSettings),
  reducer,isTerminal,component:Nineteen70sQuizGame,
};
