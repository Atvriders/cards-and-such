import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BeatlesQuizState, BeatlesQuizAction, BeatlesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BeatlesQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const beatlesQuizPlugin: GamePlugin<BeatlesQuizState, BeatlesQuizAction, typeof settings> = {
  id:"beatles-quiz", title:"Beatles Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Fab Four — John, Paul, George, and Ringo.",
  howToPlay:`Beatles Quiz tests your knowledge of the Fab Four — the band that shaped popular music forever. From their origins in Liverpool through Beatlemania, the Hamburg years, the experimental 'Sgt. Pepper' era, the 'White Album', and the legendary 'Abbey Road' rooftop, you'll be quizzed on songs, albums, members, producers, and the moments that made the Beatles immortal.\n\nYou have 15 seconds per question. Each correct answer earns 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the correct answer is always revealed before you continue. Press Next to advance.\n\nChoose 10, 20, or 30 questions in Settings. All you need is love — and a few right answers!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BeatlesQuizSettings),
  reducer,isTerminal,component:BeatlesQuizGame,
};
