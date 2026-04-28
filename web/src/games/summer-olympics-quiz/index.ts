import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SummerOlympicsQuizState, SummerOlympicsQuizAction, SummerOlympicsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SummerOlympicsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const summerOlympicsQuizPlugin: GamePlugin<SummerOlympicsQuizState, SummerOlympicsQuizAction, typeof settings> = {
  id:"summer-olympics-quiz", title:"Summer Olympics Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Summer Olympics history, athletes, and cities.",
  howToPlay:`Summer Olympics Quiz tests your knowledge of the world's premier multi-sport event. Questions span the history of the modern Summer Games — from Athens 1896 to recent editions in Beijing, London, Rio, Tokyo, and Paris — covering the host cities, legendary athletes, iconic moments, and Olympic symbols.

You'll answer questions about Usain Bolt, Michael Phelps, Jesse Owens, and many others. Topics include the meaning of the rings, the Olympic motto, host country traditions, boycotts, and political moments that shaped the Games.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points per second remaining on the timer — answer fast to maximize your score. Wrong answers earn nothing. Tap a choice and press Submit; correct answers glow green, the right answer is always revealed.

Choose 10 or 20 questions in Settings. Whether you watched Tokyo 2020 from the couch or remember Munich '72 firsthand, this quiz brings the Olympic spirit to your screen. Faster, higher, stronger — and smarter, too!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SummerOlympicsQuizSettings),
  reducer,isTerminal,component:SummerOlympicsQuizGame,
};
