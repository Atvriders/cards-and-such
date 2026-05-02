import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PluralsQuizState, PluralsQuizAction, PluralsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PluralsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["8","10","12"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const pluralsQuizPlugin: GamePlugin<PluralsQuizState, PluralsQuizAction, typeof settings> = {
  id:"plurals-quiz", title:"Plurals Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pick the correct English plural.",
  howToPlay:"Plurals Quiz is an 8-to-12 question multiple-choice puzzle covering pick the correct english plural. You'll be presented with one question at a time, each offering four lettered choices labelled A through D. Read carefully, then tap the choice you believe is correct.\n\nYou have 15 seconds per question. A correct answer awards 100 base points plus a 10-point bonus for every second remaining on the clock — so reward yourself for both knowledge and speed. Wrong answers earn nothing, but the right answer is always revealed before you continue, turning every miss into a learning moment.\n\nAfter you press Submit, the correct choice glows green and any incorrect pick turns red. Press Next to advance, and at the end you'll see your tally and final score. In Settings you can choose 8, 10, or 12 questions per round. Whether you're building vocabulary or just sharpening English reflexes, this quick puzzle is a friendly way to tune up your word skills.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PluralsQuizSettings),
  reducer,isTerminal,
  hint: (state: PluralsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:PluralsQuizGame,
};
