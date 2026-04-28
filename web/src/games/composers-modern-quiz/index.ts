import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ComposersModernQuizState, ComposersModernQuizAction, ComposersModernQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ComposersModernQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const composersModernQuizPlugin: GamePlugin<ComposersModernQuizState, ComposersModernQuizAction, typeof settings> = {
  id:"composers-modern-quiz", title:"Modern Composers Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Identify 20th and 21st century composers, their styles, and movements.",
  howToPlay:"Modern Composers Quiz dives into 20th and 21st century classical music: impressionism, atonality, twelve-tone, neoclassicism, minimalism, spectralism, and beyond. Debussy, Ravel, Stravinsky, Schoenberg, Cage, Reich, Glass, Pärt, Adams, and many others all show up in these questions.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. From Stravinsky's riots to Reich's pulsing patterns, take a tour of how classical music kept reinventing itself!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ComposersModernQuizSettings),
  reducer,isTerminal,component:ComposersModernQuizGame,
};
