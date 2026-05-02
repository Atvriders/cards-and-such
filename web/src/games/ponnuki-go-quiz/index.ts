import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PonnukiGoState, PonnukiGoAction, PonnukiGoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PonnukiGoGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const ponnukiGoPlugin: GamePlugin<PonnukiGoState, PonnukiGoAction, typeof settings> = {
  id:"ponnuki-go-quiz", title:"Ponnuki Go Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Ponnuki Go, the diamond-shape capture variant.",
  howToPlay:"Ponnuki Go is a teaching/casual Go variant in which a player who forms a 'ponnuki' — the diamond-shape of four stones surrounding a captured opponent stone — earns bonus points or wins outright. Ponnuki appears in real Go play and is famously called 'worth thirty points' in Go proverbs. The variant focuses learners' attention on this powerful shape and rewards the act of clean captures rather than territory counting.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PonnukiGoSettings),
  reducer,isTerminal,
  hint: (state: PonnukiGoState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:PonnukiGoGame,
};
