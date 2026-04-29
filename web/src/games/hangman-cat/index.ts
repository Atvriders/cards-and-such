import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HangmanCatState, HangmanCatAction, HangmanCatSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HangmanCatGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const hangmanCatPlugin: GamePlugin<HangmanCatState, HangmanCatAction, typeof settings> = {
  id:"hangman-cat", title:"Hangman (Category)", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Hangman with a category clue, a popular variant.",
  howToPlay:"Hangman (Category) Trivia is a ten-question quiz about the popular Hangman variant where the puzzle-setter announces a category clue (e.g., 'animal', 'movie', 'food') along with the blank word(s). This makes the puzzle more accessible to children and brings extra theme to gameplay. The rest of the rules match classic Hangman: guess letters one at a time, completing the word before drawing six body parts onto the figure. Many TV game shows and word-puzzle apps employ a category-style Hangman with category hints. Each question tests rules, history, and variants of Categorized Hangman. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HangmanCatSettings),
  reducer,isTerminal,component:HangmanCatGame,
};
