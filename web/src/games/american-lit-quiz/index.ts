import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AmericanLitQuizState, AmericanLitQuizAction, AmericanLitQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AmericanLitQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const americanLitQuizPlugin: GamePlugin<AmericanLitQuizState, AmericanLitQuizAction, typeof settings> = {
  id:"american-lit-quiz", title:"American Literature Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Twain, Hemingway, Morrison, Faulkner, and the great American writers.",
  howToPlay:`American Literature Quiz spans the canon of US writing — from Twain's Mississippi to Morrison's haunted past, from Hemingway's terse declaratives to Faulkner's looping Yoknapatawpha sentences.\n\nQuestions cover the major novels (The Great Gatsby, The Grapes of Wrath, To Kill a Mockingbird, Beloved, The Catcher in the Rye), iconic characters (Holden Caulfield, Atticus Finch, Jay Gatsby, Sethe), and the writers themselves: Twain, Hemingway, Fitzgerald, Steinbeck, Faulkner, Morrison, Walker, Hurston, Baldwin, Ellison, McCarthy, and more.\n\nYou will also see questions on poets (Whitman, Dickinson, Frost), playwrights (Tennessee Williams, Arthur Miller), and the Beats (Kerouac, Ginsberg).\n\nEach question has 15 seconds. Correct answers earn 100 points plus 10 per second remaining. Choose 10, 20, or 30 questions in Settings. Whether you slogged through Moby-Dick or breezed through Catch-22, this quiz is for you!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AmericanLitQuizSettings),
  reducer,isTerminal,
  hint: (state: AmericanLitQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:AmericanLitQuizGame,
};
