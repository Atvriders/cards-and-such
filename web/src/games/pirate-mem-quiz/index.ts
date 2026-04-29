import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PirateMemQuizState, PirateMemQuizAction, PirateMemQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PirateMemQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const pirateMemQuizPlugin: GamePlugin<PirateMemQuizState, PirateMemQuizAction, typeof settings> = {
  id:"pirate-mem-quiz", title:"Pirate Memory Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Pirate Memory, the ship-and-treasure pair-matching memory game for children.",
  howToPlay:"Pirate Memory Trivia is a ten-question quiz about a popular children's variant of the classic memory tile-flip game where the deck is themed with pirates, ships, treasure chests, parrots, and tropical islands. Each round you'll be tested on the rules of concentration, common pirate-deck tile contents, age ranges, publishers of themed memory decks, and the educational values of the game. Tap your answer and press Submit; a correct answer awards 100 base points plus 10 per second remaining on the 15-second timer. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is displayed. Pirate Memory is a perennial bestseller in nursery and bookshop bins thanks to its swashbuckling art and the timeless appeal of the matching mechanic — see how much pirate-deck trivia you can recall.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PirateMemQuizSettings),
  reducer,isTerminal,component:PirateMemQuizGame,
};
