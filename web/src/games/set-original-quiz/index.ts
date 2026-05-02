import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SetOriginalQuizState, SetOriginalQuizAction, SetOriginalQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SetOriginalQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const setOriginalQuizPlugin: GamePlugin<SetOriginalQuizState, SetOriginalQuizAction, typeof settings> = {
  id:"set-original-quiz", title:"SET Game Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about SET, the visual pattern-recognition card game by Marsha Falco.",
  howToPlay:"SET Game Trivia is a ten-question quiz about SET, the elegant pattern-recognition card game where players race to find a 'Set' of three cards in which each of four traits (number, color, shape, shading) is either all the same or all different. Each round you'll be tested on the deck size (81 cards forming a finite affine geometry), Marsha Falco's invention story, the rules for legal sets, scoring penalties, and award history. Tap your answer and press Submit; a correct answer awards 100 base points plus 10 per second remaining on the 15-second timer. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is displayed. SET is famous for being mathematically perfect: every two cards uniquely determine a third — see how well you remember its quiet brilliance.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SetOriginalQuizSettings),
  reducer,isTerminal,
  hint: (state: SetOriginalQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SetOriginalQuizGame,
};
