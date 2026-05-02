import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BirdCareQuizState, BirdCareQuizAction, BirdCareQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BirdCareQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const birdCareQuizPlugin: GamePlugin<BirdCareQuizState, BirdCareQuizAction, typeof settings> = {
  id:"bird-care-quiz", title:"Bird Care Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Parrots, finches, canaries — test your avian care know-how.",
  howToPlay:"Bird Care Quiz tests your knowledge of pet birds — from parakeets and cockatiels to large parrots like macaws and African greys. Topics include diet, cage size, vet care, enrichment, and behavior. Birds are intelligent companions with long lifespans and demanding needs.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Spread your wings and dive in!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BirdCareQuizSettings),
  reducer,isTerminal,
  hint: (state: BirdCareQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:BirdCareQuizGame,
};
