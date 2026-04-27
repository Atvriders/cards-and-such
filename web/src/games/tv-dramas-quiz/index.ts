import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TvDramasQuizState, TvDramasQuizAction, TvDramasQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TvDramasQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const tvDramasQuizPlugin: GamePlugin<TvDramasQuizState, TvDramasQuizAction, typeof settings> = {
  id:"tv-dramas-quiz", title:"TV Dramas Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of prestige TV dramas — Sopranos, Breaking Bad, Mad Men, and more.",
  howToPlay:`TV Dramas Quiz tests your knowledge of the prestige television era. From 'The Sopranos' that launched the golden age, through 'Breaking Bad', 'Mad Men', 'The Wire', 'Game of Thrones', and modern hits like 'Succession' and 'Stranger Things', you'll be quizzed on characters, creators, settings, and the iconic moments that made these shows unforgettable.\n\nYou have 15 seconds per question. Each correct answer earns 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the correct answer is always revealed before you continue. Press Next to advance.\n\nChoose 10, 20, or 30 questions in Settings. Tune in!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TvDramasQuizSettings),
  reducer,isTerminal,component:TvDramasQuizGame,
};
