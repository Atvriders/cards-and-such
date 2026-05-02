import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DutchBlitzExpQuizState, DutchBlitzExpQuizAction, DutchBlitzExpQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DutchBlitzExpQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const dutchBlitzExpQuizPlugin: GamePlugin<DutchBlitzExpQuizState, DutchBlitzExpQuizAction, typeof settings> = {
  id:"dutch-blitz-exp-quiz", title:"Dutch Blitz Expansion Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Dutch Blitz Expansion Pack, the 8-player extension to Dutch Blitz.",
  howToPlay:"Dutch Blitz Expansion Trivia is a ten-question quiz about the Expansion Pack to the classic Pennsylvania Dutch–themed simultaneous speed card game. The expansion adds two extra colored decks, raising the maximum from 4 to 8 players and enabling team play. Each round you'll be tested on Dutch Blitz's publisher, the Pennsylvania Dutch theme on the cards, the rules for teams, the way Blitz piles work, and the extra colors added. Tap your answer and press Submit; a correct answer awards 100 base points plus 10 per second remaining on the 15-second timer. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is displayed. The Dutch Blitz Expansion is praised for keeping the game's frantic charm intact while doubling the seats — test what you know.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DutchBlitzExpQuizSettings),
  reducer,isTerminal,
  hint: (state: DutchBlitzExpQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:DutchBlitzExpQuizGame,
};
