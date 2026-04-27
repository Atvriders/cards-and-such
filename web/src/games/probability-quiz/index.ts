import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ProbabilityQuizState, ProbabilityQuizAction, ProbabilityQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ProbabilityQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const probabilityQuizPlugin: GamePlugin<ProbabilityQuizState, ProbabilityQuizAction, typeof settings> = {
  id:"probability-quiz", title:"Probability Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Probability theory: events, expected value, combinations, conditional.",
  howToPlay:"Probability Quiz tests your ability to compute likelihoods quickly. Topics include classical probability (dice, coins, cards), independent and dependent events, conditional probability, Bayes-style reasoning, expected value, combinations and permutations (n choose k), and a few classic puzzles like the Monty Hall problem and the birthday paradox.\n\nYou have 15 seconds per question. Correct answers award 100 base points plus 10 per second remaining. Wrong answers earn zero but reveal the right answer.\n\nTap a choice and press Submit. Green is correct, red is wrong. Press Next to advance.\n\nChoose 10 or 20 questions in Settings. Whether you're a poker player, a card counter, a student of mathematical statistics, or just love a good probability puzzle, this quiz will exercise your statistical intuition. Watch for the trap answers — humans are bad at probability!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ProbabilityQuizSettings),
  reducer,isTerminal,component:ProbabilityQuizGame,
};
