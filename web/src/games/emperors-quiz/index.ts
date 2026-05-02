import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EmperorsQuizState, EmperorsQuizAction, EmperorsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EmperorsQuizGame } from "./Game.js";
const settings = { questionCount: { kind:"enum" as const, label:"Questions", options:["5","10","15"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const emperorsQuizPlugin: GamePlugin<EmperorsQuizState, EmperorsQuizAction, typeof settings> = {
  id:"emperors-quiz", title:"Emperors Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of great emperors across Rome, China, Japan, France, and beyond.",
  howToPlay:`Emperors Quiz spans the great imperial rulers of world history. Questions cover Roman emperors from Augustus to Romulus Augustulus, Chinese emperors like Qin Shi Huang, Mongol rulers like Genghis Khan, Napoleon Bonaparte, Ottoman sultans, Mughal emperors like Shah Jahan, and Japanese emperors of the modern era.

Each question has four choices. Pick the correct answer to earn 10 points. The right answer turns green; wrong guesses reveal in red.

Press Next to advance. Choose 5, 10, or 15 questions in Settings.

Key facts: Augustus was Rome's first emperor; Constantine converted Rome to Christianity; Nero ruled during the Great Fire; Marcus Aurelius was the Philosopher Emperor; Shah Jahan built the Taj Mahal; Mehmed II conquered Constantinople in 1453; Napoleon was exiled to Elba after defeat. Master these and conquer the quiz!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EmperorsQuizSettings),
  reducer,isTerminal,
  hint: (state: EmperorsQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:EmperorsQuizGame,
};
