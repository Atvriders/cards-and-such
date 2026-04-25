import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardColorGuessState, CardColorGuessAction, CardColorGuessSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardColorGuess } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cardColorGuessPlugin: GamePlugin<CardColorGuessState, CardColorGuessAction, typeof settings> = {
  id:"card-color-guess", title:"Card Color Guess", category:"cards",
  players:{min:1,max:1,multiplayer:false},
  description:"Guess if the next flipped card is red or black! Build streaks for bonus points.",
  howToPlay:`Card Color Guess is a fast and simple card game. Each round a card is hidden face-down. You press Red (hearts and diamonds) or Black (spades and clubs) to guess the card's color. Then the card is revealed!

A correct guess scores 10 points. Keeping a streak going earns bonus points: each consecutive correct answer adds 2 extra points (so a 3-streak earns 16 pts per correct answer, a 5-streak earns 20, and so on). A wrong guess resets your streak to zero.

With 26 red and 26 black cards in the deck, each guess is essentially 50/50 — unless you track which cards have been seen. Cards are shuffled fresh each game.

Play 10 or 20 rounds using Settings. Maximum possible score grows with your streak. The real goal is keeping that streak alive as long as possible. Simple to play, hard to master — can you guess correctly every time?`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardColorGuessSettings),
  reducer, isTerminal, component:CardColorGuess,
};
