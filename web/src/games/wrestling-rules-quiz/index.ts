import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WrestlingRulesQuizState, WrestlingRulesQuizAction, WrestlingRulesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WrestlingRulesQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const wrestlingRulesQuizPlugin: GamePlugin<WrestlingRulesQuizState, WrestlingRulesQuizAction, typeof settings> = {
  id:"wrestling-rules-quiz", title:"Wrestling Rules Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of freestyle and Greco-Roman wrestling rules.",
  howToPlay:`Wrestling Rules Quiz tests your knowledge of one of the oldest Olympic sports — dating back to the ancient Greek Games of 708 BC. Questions cover the two main Olympic styles: freestyle (where leg attacks are allowed) and Greco-Roman (where holds are restricted to above the waist).

You'll be quizzed on scoring (takedowns earn 2 points, high-amplitude throws 5), match structure (two 3-minute periods), how to win (pin, technical superiority, points, or default), and key terms like passivity, fall, and stalling. Topics also cover mat dimensions, weight classes, the introduction of women's freestyle at Athens 2004, and legendary wrestlers like Aleksandr Karelin and Buvaisar Saitiev.

You have 15 seconds per question. Correct answers earn 100 base points plus 10 per second remaining on the timer; wrong answers earn nothing. Tap a choice and press Submit; correct answers glow green, the right answer is always revealed.

Choose 10 or 20 questions in Settings. Take your knowledge to the mat!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as WrestlingRulesQuizSettings),
  reducer,isTerminal,
  hint: (state: WrestlingRulesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:WrestlingRulesQuizGame,
};
