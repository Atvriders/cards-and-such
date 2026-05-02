import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CaptureGoState, CaptureGoAction, CaptureGoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CaptureGoGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const captureGoPlugin: GamePlugin<CaptureGoState, CaptureGoAction, typeof settings> = {
  id:"capture-go-quiz", title:"Capture Go Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Capture Go, a teaching variant of the ancient game of Go.",
  howToPlay:"Capture Go is a beginner-friendly variant of Go where the goal is simplified: capture a fixed number of opposing stones — usually one or three — to win. There is no territory counting, no komi, and no scoring complexity. Capture Go strips Go down to its essence — liberties, atari, and ladders — and is the standard first lesson in modern Go pedagogy. It teaches the fundamentals of capturing without overwhelming new players with full Go scoring.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CaptureGoSettings),
  reducer,isTerminal,
  hint: (state: CaptureGoState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:CaptureGoGame,
};
