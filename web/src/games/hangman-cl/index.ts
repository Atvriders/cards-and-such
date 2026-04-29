import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HangmanClState, HangmanClAction, HangmanClSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HangmanClGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const hangmanClPlugin: GamePlugin<HangmanClState, HangmanClAction, typeof settings> = {
  id:"hangman-cl", title:"Hangman (Classic)", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Hangman, the classic letter-guessing word game.",
  howToPlay:"Hangman Classic Trivia is a ten-question quiz about Hangman, the classic word-guessing pencil-and-paper game first recorded in late 19th-century England. One player chooses a secret word and draws blanks corresponding to each letter. The other player guesses letters one at a time. Correct letters fill in their position(s); incorrect letters add a body part to a stick-figure 'hanged man' (head, body, two arms, two legs — six wrong guesses to lose). The guesser wins by completing the word before the figure is fully drawn. Hangman appears in most pencil-and-paper game collections globally. Each question tests rules, history, and variants of Hangman. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HangmanClSettings),
  reducer,isTerminal,component:HangmanClGame,
};
