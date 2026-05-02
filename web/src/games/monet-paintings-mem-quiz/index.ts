import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MonetPaintingsMemQuizState, MonetPaintingsMemQuizAction, MonetPaintingsMemQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MonetPaintingsMemQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const monetPaintingsMemQuizPlugin: GamePlugin<MonetPaintingsMemQuizState, MonetPaintingsMemQuizAction, typeof settings> = {
  id:"monet-paintings-mem-quiz", title:"Monet Memory Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Monet Paintings Memory, the impressionist art tile-matching memory game.",
  howToPlay:"Monet Memory Quiz is a ten-question quiz about Monet Paintings Memory, an art-museum themed variant of the classic concentration card-flip matching game where each tile depicts a famous Claude Monet painting. Each round you'll be tested on Monet's most famous works, his place in the impressionist movement, common deck contents, the artist's biography, and the basic matching rules. Tap your answer and press Submit; a correct answer awards 100 base points plus 10 per second left on the 15-second timer. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions your final score is displayed. Art-memory decks like Monet's pair learning with play, helping children and adults absorb art history through repeated exposure to iconic images — test your gallery brain.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MonetPaintingsMemQuizSettings),
  reducer,isTerminal,
  hint: (state: MonetPaintingsMemQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:MonetPaintingsMemQuizGame,
};
