import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HappySalmonQuizState, HappySalmonQuizAction, HappySalmonQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HappySalmonQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const happySalmonQuizPlugin: GamePlugin<HappySalmonQuizState, HappySalmonQuizAction, typeof settings> = {
  id:"happy-salmon-quiz", title:"Happy Salmon Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Happy Salmon, the loud rapid-fire shouting card matching party game.",
  howToPlay:"Happy Salmon Trivia is a ten-question quiz dedicated to the chaotic rapid-fire party card game where players shout one of four actions and rush to match with someone making the same call. Each round you'll be asked about its four iconic actions — Happy Salmon, High Five, Pound It, and Switcheroo — its publisher Exploding Kittens / North Star Games, its compact pouch packaging, recommended ages, and target play time. Tap the answer you believe is correct and press Submit. A correct answer awards 100 base points plus 10 per second remaining on the 15-second timer, so move fast. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions your final score appears. Happy Salmon is famed for being the world's loudest 90-second card game — see how much you remember about a game that demands almost no remembering at all.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HappySalmonQuizSettings),
  reducer,isTerminal,
  hint: (state: HappySalmonQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:HappySalmonQuizGame,
};
