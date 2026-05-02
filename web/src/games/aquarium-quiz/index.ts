import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AquariumQuizState, AquariumQuizAction, AquariumQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AquariumQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const aquariumQuizPlugin: GamePlugin<AquariumQuizState, AquariumQuizAction, typeof settings> = {
  id:"aquarium-quiz", title:"Aquarium Care Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Cycling, pH, fish — test your aquarium hobby knowledge.",
  howToPlay:"Aquarium Care Quiz tests your knowledge of fishkeeping. From the nitrogen cycle and water chemistry to species compatibility, planted tanks, and saltwater reefs, this quiz covers freshwater and marine essentials.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Dip your toe in — let's see how clear your aquarium IQ is!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AquariumQuizSettings),
  reducer,isTerminal,
  hint: (state: AquariumQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:AquariumQuizGame,
};
