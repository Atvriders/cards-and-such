import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TeeKoQuizState, TeeKoQuizAction, TeeKoQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TeeKoQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const teeKoQuizPlugin: GamePlugin<TeeKoQuizState, TeeKoQuizAction, typeof settings> = {
  id:"tee-ko-quiz", title:"Tee K.O. Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Tee K.O., the design-a-shirt voting party game from Jackbox.",
  howToPlay:"Tee K.O. Trivia is dedicated to the wonderfully creative Jackbox Games entry where players draw shirt designs and write slogans that get scrambled together for matchup voting. Topics cover the Pack number, voting rules, audience mode, recommended player counts, and the bracket-style finals. Each round has ten questions. Tap an answer and press Submit. Correct answers award 100 base points plus 10 points per second remaining on the 15-second timer, rewarding quick picks. Wrong answers reveal the correct option and lock the round; press Next to advance. After question ten, your final score is shown. If you've ever watched a doodle of a sad onion get paired with a slogan about taxes and won the championship round, this quiz proves how well you know the rules behind one of Jackbox's most beloved party experiences.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TeeKoQuizSettings),
  reducer,isTerminal,component:TeeKoQuizGame,
};
