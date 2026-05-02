import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BadukState, BadukAction, BadukSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BadukGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const badukPlugin: GamePlugin<BadukState, BadukAction, typeof settings> = {
  id:"baduk-quiz", title:"Baduk Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Baduk, the Korean tradition of Go.",
  howToPlay:"Baduk is the Korean name for the ancient board game of Go. Korea developed its own deep tradition of professional Baduk in the 20th century, producing a string of world champions including Lee Chang-ho, Lee Sedol, and Park Junghwan. Korean Baduk uses the same 19x19 board, stones, and core rules as Japanese and Chinese Go, but Korean professional rules and tournaments have unique conventions, and the cultural prestige of the game in Korea is unmatched.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BadukSettings),
  reducer,isTerminal,
  hint: (state: BadukState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:BadukGame,
};
