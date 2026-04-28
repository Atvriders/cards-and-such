import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GymnasticsQuizState, GymnasticsQuizAction, GymnasticsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GymnasticsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const gymnasticsQuizPlugin: GamePlugin<GymnasticsQuizState, GymnasticsQuizAction, typeof settings> = {
  id:"gymnastics-quiz", title:"Gymnastics Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of artistic, rhythmic, and trampoline gymnastics.",
  howToPlay:`Gymnastics Quiz tests your knowledge of the most-watched Olympic sport. Questions span artistic gymnastics for both men (six apparatus) and women (four apparatus), rhythmic gymnastics, and trampoline. You'll be quizzed on equipment specs — beam width, horizontal bar height, the difference between rings and parallel bars — and on the iconic Code of Points scoring transition away from the perfect 10.

Legends are central: Nadia Comăneci scoring the first perfect 10 in 1976, Olga Korbut's iconic flip, Larisa Latynina's medal record, Simone Biles's modern dominance, and skills named after gymnasts like Yurchenko. Trampoline's debut at Sydney 2000 gets a question, as does the Sphinx-balanced 'Korbut Flip' that's now banned.

You have 15 seconds per question. Correct answers earn 100 base points plus 10 per second remaining; wrong answers earn nothing. Tap a choice and press Submit; correct answers glow green, the right answer is revealed.

Choose 10 or 20 questions in Settings. Stick the landing!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GymnasticsQuizSettings),
  reducer,isTerminal,component:GymnasticsQuizGame,
};
