import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PuzzleMindQuizState, PuzzleMindQuizAction, PuzzleMindQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PuzzleMindQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const puzzleMindQuizPlugin: GamePlugin<PuzzleMindQuizState, PuzzleMindQuizAction, typeof settings> = {
  id:"puzzle-mind-quiz", title:"Brain Teasers Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Brain teasers and lateral thinking puzzles.",
  howToPlay:"Brain Teasers Quiz collects classic riddles, lateral thinking puzzles, and trick questions. Some test pattern recognition, some require thinking outside the box, and a few are deliberate misdirections that punish snap judgments. Topics include sequence puzzles, visualization riddles, river-crossing setups, classic age problems, weighing puzzles, and famous trick questions.\n\nYou have 15 seconds per question. Correct answers earn 100 base points plus 10 per second remaining. Wrong answers earn zero but reveal the right answer.\n\nTap a choice and press Submit. Green is correct, red is wrong. Press Next to advance.\n\nChoose 10 or 20 questions in Settings. Whether you're a Rubik's cube champion, a fan of Will Shortz, or just love a good \"aha!\" moment, this quiz will exercise your lateral thinking. Read each question carefully — the obvious answer is often a trap!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PuzzleMindQuizSettings),
  reducer,isTerminal,
  hint: (state: PuzzleMindQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:PuzzleMindQuizGame,
};
