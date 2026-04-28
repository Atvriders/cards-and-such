import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GrammyAwardsQuizState, GrammyAwardsQuizAction, GrammyAwardsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GrammyAwardsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const grammyAwardsQuizPlugin: GamePlugin<GrammyAwardsQuizState, GrammyAwardsQuizAction, typeof settings> = {
  id:"grammy-awards-quiz", title:"Grammy Awards Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Grammy Award winners and history from 1959 to today.",
  howToPlay:"Grammy Awards Quiz tests your knowledge of music's biggest night. Questions span the entire history — from the first ceremony in 1959 to landmark Album of the Year wins, surprise upsets, the youngest and oldest winners, the EGOT achievers, and the artists who've cleaned up across multiple decades.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you remember Adele's sweep, Beyoncé's record-breaking total, or U Got the Look, Grammy Awards Quiz will test you across every era and genre.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GrammyAwardsQuizSettings),
  reducer,isTerminal,component:GrammyAwardsQuizGame,
};
