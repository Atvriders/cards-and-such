import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ParalympicsQuizState, ParalympicsQuizAction, ParalympicsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ParalympicsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const paralympicsQuizPlugin: GamePlugin<ParalympicsQuizState, ParalympicsQuizAction, typeof settings> = {
  id:"paralympics-quiz", title:"Paralympics Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Paralympic Games, athletes, and disciplines.",
  howToPlay:`Paralympics Quiz tests your knowledge of the world's elite sports event for athletes with disabilities. Questions span the history from the first Stoke Mandeville Games and Rome 1960, through to recent editions in Tokyo, Beijing, and Paris — covering host cities, legendary athletes, and groundbreaking sports.

You'll learn about figures like Ludwig Guttmann, Tatyana McFadden, Oscar Pistorius, Markus Rehm, and Jonnie Peacock. Topics include sports unique to the Paralympics — goalball, boccia, sled hockey, sitting volleyball, wheelchair rugby — as well as familiar disciplines adapted for adaptive athletics. The Paralympic motto and the Three Agitos symbol get their moment too.

You have 15 seconds per question. Correct answers earn 100 base points plus 10 per second remaining; wrong answers earn nothing. Tap a choice and press Submit; correct answers glow green, the right answer is always revealed.

Choose 10 or 20 questions in Settings. Spirit in motion — this quiz celebrates the resilience and excellence of Paralympic athletes from around the world.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ParalympicsQuizSettings),
  reducer,isTerminal,component:ParalympicsQuizGame,
};
