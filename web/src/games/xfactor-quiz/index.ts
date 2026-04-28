import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { XfactorQuizState, XfactorQuizAction, XfactorQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { XfactorQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const xfactorQuizPlugin: GamePlugin<XfactorQuizState, XfactorQuizAction, typeof settings> = {
  id:"xfactor-quiz", title:"X Factor Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of The X Factor UK and US, contestants, and judges.",
  howToPlay:"X Factor Quiz covers the British music competition franchise, which spawned global versions and launched stars like One Direction, Little Mix, Olly Murs, Leona Lewis, and James Arthur. You'll get questions on the original UK show, the short-lived US version with Simon Cowell, judges' chairs, and famous breakout moments.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Are you a four-chair turn or a sad bus ride home? Find out!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as XfactorQuizSettings),
  reducer,isTerminal,component:XfactorQuizGame,
};
