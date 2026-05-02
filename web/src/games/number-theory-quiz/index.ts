import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NumberTheoryQuizState, NumberTheoryQuizAction, NumberTheoryQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NumberTheoryQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const numberTheoryQuizPlugin: GamePlugin<NumberTheoryQuizState, NumberTheoryQuizAction, typeof settings> = {
  id:"number-theory-quiz", title:"Number Theory Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Number theory: primes, divisibility, modular arithmetic.",
  howToPlay:"Number Theory Quiz tests your knowledge of integers, primes, factorization, divisibility, modular arithmetic, GCD/LCM, and famous theorems. Topics include the fundamental theorem of arithmetic, Fermat's little theorem, Euler's phi function (basics), Pythagorean triples, perfect numbers, and Diophantine equations.\n\nYou have 15 seconds per question. Correct answers earn 100 base points plus 10 per second remaining; wrong answers earn zero but reveal the right answer.\n\nTap a choice and press Submit. Green is correct, red is wrong. Press Next to advance.\n\nChoose 10 or 20 questions in Settings. Whether you're a competition math veteran, a curious cryptography hobbyist, or just love prime numbers, this quiz will test your knowledge of the abstract beauty of integers. Some questions test computation; others test concepts.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NumberTheoryQuizSettings),
  reducer,isTerminal,
  hint: (state: NumberTheoryQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:NumberTheoryQuizGame,
};
