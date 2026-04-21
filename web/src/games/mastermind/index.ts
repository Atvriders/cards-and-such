import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MastermindState, MastermindAction, MastermindSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Mastermind } from "./Game.js";

const settings = {} as const;

export const mastermindPlugin: GamePlugin<MastermindState, MastermindAction, typeof settings> = {
  id: "mastermind",
  title: "Mastermind",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Crack the 4-color code in 10 guesses. Feedback shows position matches and color-only matches.",
  howToPlay: `Mastermind is a code-breaking game where the computer has secretly chosen a 4-color sequence from 6 possible colors: red, orange, yellow, green, blue, and purple. Colors may repeat in the secret code.

You have up to 10 guesses to crack the code. After each guess you receive feedback in the form of black and white pegs. A black peg means one of your colors is exactly right — correct color in the correct position. A white peg means one of your colors is in the code but in the wrong position. Pegs don't indicate which slot is correct — only the total count.

To make a guess: click any of the four large pegs to select it, then click a color from the palette below to assign that color. Repeat for each peg, then click Submit Guess. You can also click Clear to reset your current guess.

Your score is calculated as (11 minus the number of guesses used) times 100. So cracking the code on your first guess gives 1000 points, while using all 10 guesses gives 100 points. Failing to crack the code gives 0.

Tip: use the feedback carefully. If you get no pegs at all, none of those colors appear at all in the code — eliminate them immediately.`,
  settings,
  initialState: (seed: number, s: MastermindSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  component: Mastermind,
};
