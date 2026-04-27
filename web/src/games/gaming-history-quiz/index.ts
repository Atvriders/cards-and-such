import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GamingHistoryQuizState, GamingHistoryQuizAction, GamingHistoryQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GamingHistoryQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const gamingHistoryQuizPlugin: GamePlugin<GamingHistoryQuizState, GamingHistoryQuizAction, typeof settings> = {
  id:"gaming-history-quiz", title:"Video Gaming History Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Atari, Nintendo, and the eras of gaming.",
  howToPlay:"Video Gaming History Quiz challenges you on the milestones of interactive entertainment: from Pong and the golden arcade era through the home-console wars (Atari, Nintendo, Sega, Sony, Microsoft), the rise of PC gaming, the FPS and RPG explosions, and modern phenomena like esports and battle royales. Test your knowledge of franchises, designers, and consoles that shaped culture.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock \u2014 fast, accurate answers earn the highest score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you grew up on Atari, traded Pok\u00e9mon cards, or build creations in Minecraft, this quiz will take you through gaming's greatest hits!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GamingHistoryQuizSettings),
  reducer,isTerminal,component:GamingHistoryQuizGame,
};
