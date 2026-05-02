import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RenjuState, RenjuAction, RenjuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RenjuGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const renjuPlugin: GamePlugin<RenjuState, RenjuAction, typeof settings> = {
  id:"renju-quiz", title:"Renju Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Renju, the competitive five-in-a-row variant.",
  howToPlay:"Renju is the competitive Japanese form of Gomoku (five-in-a-row), played on a 15x15 board with a special rule set that handicaps Black to prevent trivial wins from going first. Black is forbidden from creating double-threes, double-fours, or overlines (six or more in a row) — fouls that cost Black the game. Renju has a strong international tournament circuit and is governed by the Renju International Federation (RIF).\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RenjuSettings),
  reducer,isTerminal,
  hint: (state: RenjuState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:RenjuGame,
};
