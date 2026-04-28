import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FigureSkatingQuizState, FigureSkatingQuizAction, FigureSkatingQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FigureSkatingQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const figureSkatingQuizPlugin: GamePlugin<FigureSkatingQuizState, FigureSkatingQuizAction, typeof settings> = {
  id:"figure-skating-quiz", title:"Figure Skating Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of figure skating disciplines, jumps, and stars.",
  howToPlay:`Figure Skating Quiz tests your knowledge of one of the Winter Olympics' most popular events. Questions cover the four disciplines — men's singles, women's singles, pairs, and ice dance — along with the jumps (axel, salchow, lutz, loop, flip, toe loop) and the differences between them.

Topics include legendary names: Sonja Henie, Yuzuru Hanyu, Kim Yuna, Tara Lipinski, Tonya Harding, Nancy Kerrigan, Surya Bonaly, and many others. You'll be quizzed on quad jumps' history (Kurt Browning's 1988 first), scoring evolution beyond the perfect 10, and the technical elements that distinguish ice dance from pairs (no overhead lifts!).

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 per second remaining; wrong answers earn nothing. Tap a choice and press Submit; correct answers glow green, the right answer is always shown.

Choose 10 or 20 questions in Settings. Glide your way to a high score and impress your inner ice ice baby!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FigureSkatingQuizSettings),
  reducer,isTerminal,component:FigureSkatingQuizGame,
};
