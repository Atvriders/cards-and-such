import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EntrepreneursQuizState, EntrepreneursQuizAction, EntrepreneursQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EntrepreneursQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const entrepreneursQuizPlugin: GamePlugin<EntrepreneursQuizState, EntrepreneursQuizAction, typeof settings> = {
  id:"entrepreneurs-quiz", title:"Famous Entrepreneurs Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"The visionary founders who built today's biggest brands.",
  howToPlay:"Famous Entrepreneurs Quiz tests your knowledge of the world's most influential business builders. Questions cover startup founders and industry titans — Bezos, Gates, Branson, Jobs, Disney, Ford, Walton, Buffett, Zuckerberg, Musk and many more — including their flagship companies, founding years, signature deals and IPOs that defined modern capitalism.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Pitch yourself — see if you can identify the visionaries who built the brands you use every day.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EntrepreneursQuizSettings),
  reducer,isTerminal,component:EntrepreneursQuizGame,
};
