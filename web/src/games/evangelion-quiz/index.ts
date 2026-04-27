import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EvangelionQuizState, EvangelionQuizAction, EvangelionQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EvangelionQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const evangelionQuizPlugin: GamePlugin<EvangelionQuizState, EvangelionQuizAction, typeof settings> = {
  id:"evangelion-quiz", title:"Evangelion Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your Neon Genesis Evangelion knowledge: Eva units, Angels, NERV, and Instrumentality.",
  howToPlay:`Evangelion Quiz tests your knowledge of Hideaki Anno's groundbreaking psychological mecha anime. Questions cover the Evangelion units, the Angels, NERV, SEELE, the Marduk Institute, the Children pilots — Shinji, Asuka, Rei, Kaworu — the Human Instrumentality Project, the Adam and Lilith mythology, the Spear of Longinus, and the Rebuild of Evangelion film tetralogy.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers and timeouts earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move to the next question.

Choose 10 or 20 questions. Get in the Eva, Shinji — and answer correctly!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EvangelionQuizSettings),
  reducer,isTerminal,component:EvangelionQuizGame,
};
