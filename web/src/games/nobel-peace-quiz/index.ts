import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NobelPeaceQuizState, NobelPeaceQuizAction, NobelPeaceQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NobelPeaceQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const nobelPeaceQuizPlugin: GamePlugin<NobelPeaceQuizState, NobelPeaceQuizAction, typeof settings> = {
  id:"nobel-peace-quiz", title:"Nobel Peace Prize Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Nobel Peace Prize.",
  howToPlay:"Nobel Peace Prize Quiz tests your knowledge of one of the world's most prestigious honors. Awarded since 1901 according to Alfred Nobel's will, the prize recognizes work for peace, human rights, disarmament, and humanitarian causes. Unlike the other Nobels — given out in Stockholm — the Peace Prize is awarded in Oslo, Norway.\n\nQuestions cover famous laureates (Mandela, MLK, Gandhi the perpetual snub, Mother Teresa, Malala, the Dalai Lama), organizations (ICRC, UNHCR, MSF, IPCC, OPCW), the Nobel Committee, controversial winners, and unique features like the gold medal and the diploma.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly. Wrong answers earn zero. Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Choose 10 or 20 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NobelPeaceQuizSettings),
  reducer,isTerminal,
  hint: (state: NobelPeaceQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:NobelPeaceQuizGame,
};
