import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MatchPointQuizState, MatchPointQuizAction, MatchPointQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MatchPointQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const matchPointQuizPlugin: GamePlugin<MatchPointQuizState, MatchPointQuizAction, typeof settings> = {
  id:"match-point-quiz", title:"Match Point Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Match Point, the tennis-scored fast pair-call card game.",
  howToPlay:"Match Point Trivia is a ten-question quiz about a tennis-scored variant of card pair-matching where players race to call out a matching pair from cards in the playing area, with rounds won and lost using tennis scoring (15, 30, 40, deuce). Each round you'll be tested on the rules of pair-calling, the tennis-style scoring, recommended player count, the importance of fast observation, and how pairs are formed. Tap your answer and press Submit; a correct answer awards 100 base points plus 10 per second remaining on the 15-second timer. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is displayed. Match Point combines the joy of fast pattern recognition with the dramatic ebb and flow of tennis scoring — see how fast you can recall its twists.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MatchPointQuizSettings),
  reducer,isTerminal,
  hint: (state: MatchPointQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:MatchPointQuizGame,
};
