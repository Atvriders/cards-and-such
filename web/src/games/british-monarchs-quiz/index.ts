import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BritishMonarchsQuizState, BritishMonarchsQuizAction, BritishMonarchsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BritishMonarchsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const britishMonarchsQuizPlugin: GamePlugin<BritishMonarchsQuizState, BritishMonarchsQuizAction, typeof settings> = {
  id:"british-monarchs-quiz", title:"British Monarchs Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Kings and queens of England and the United Kingdom across the ages.",
  howToPlay:"British Monarchs Quiz tests your knowledge of the kings and queens who ruled England, Scotland and the United Kingdom. Questions span Norman conquerors, Plantagenet warriors, Tudor dynasties, Stuart upheavals, Hanoverian Georgians, Victorian imperialism, and the modern Windsors — covering reigns, marriages, wars, and royal scandals across more than 1,000 years.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Long live the king (or queen) — see how royal your knowledge really is!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BritishMonarchsQuizSettings),
  reducer,isTerminal,
  hint: (state: BritishMonarchsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:BritishMonarchsQuizGame,
};
