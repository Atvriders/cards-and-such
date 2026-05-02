import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SushiCatsMemQuizState, SushiCatsMemQuizAction, SushiCatsMemQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SushiCatsMemQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const sushiCatsMemQuizPlugin: GamePlugin<SushiCatsMemQuizState, SushiCatsMemQuizAction, typeof settings> = {
  id:"sushi-cats-mem-quiz", title:"Sushi Cats Memory Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Sushi Cats Memory, the cats-at-sushi tile memory pair game.",
  howToPlay:"Sushi Cats Memory Trivia is a ten-question quiz about a charming children's memory tile game where each tile depicts cats lounging on different sushi rolls, and players race to find matching pairs. Each round you'll be tested on its tile contents, sushi types depicted, basic concentration rules, the publishers who sell similar themed memory decks, and the educational benefits of repeated visual matching. Tap your answer and press Submit; a correct answer awards 100 base points plus 10 per second remaining on the 15-second timer. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is displayed. Sushi Cats Memory blends two of the internet's favourite obsessions — see how much you remember from one of the cutest niche memory decks.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SushiCatsMemQuizSettings),
  reducer,isTerminal,
  hint: (state: SushiCatsMemQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SushiCatsMemQuizGame,
};
