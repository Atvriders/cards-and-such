import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BotanyQuizState, BotanyQuizAction, BotanyQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BotanyQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const botanyQuizPlugin: GamePlugin<BotanyQuizState, BotanyQuizAction, typeof settings> = {
  id:"botany-quiz", title:"Botany Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of plant species, photosynthesis, and plant families.",
  howToPlay:"Botany Quiz challenges you on the science of plants: photosynthesis, plant anatomy, major plant families, ecology, and famous botanists. Questions span everything from the parts of a flower and how trees make wood to the difference between gymnosperms and angiosperms and what role chlorophyll plays in life on Earth.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock \u2014 fast, accurate answers earn the highest score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you're a gardener, a botany student, or just curious about the green world that supports life, this quiz will help you grow your plant knowledge!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BotanyQuizSettings),
  reducer,isTerminal,component:BotanyQuizGame,
};
