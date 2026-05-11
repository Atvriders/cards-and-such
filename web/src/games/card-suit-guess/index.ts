import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardSuitGuessState, CardSuitGuessAction, CardSuitGuessSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardSuitGuess = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardSuitGuess as unknown as React.ComponentType<unknown> })));
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cardSuitGuessPlugin: GamePlugin<CardSuitGuessState, CardSuitGuessAction, typeof settings> = {
  id:"card-suit-guess", title:"Card Suit Guess", category:"cards",
  players:{min:1,max:1,multiplayer:false},
  description:"Guess the suit of the hidden card — spades, hearts, diamonds, or clubs! 1 in 4 chance each time.",
  howToPlay:`Card Suit Guess is a simple but challenging card game. Each round a card is hidden face-down. You must guess its suit from four choices: Spades, Hearts, Diamonds, or Clubs.

Each correct guess earns 250 points. Since there is a 1 in 4 chance of guessing correctly each round, a perfect game of 10 rounds would yield 2500 points — but that would require extraordinary luck!

There is no trick to it — it is pure probability and intuition. Suits are evenly distributed (13 cards each), so each guess is genuinely 25% for each option. Some players swear by always picking the same suit; others try to track what has been revealed.

Use Settings to play 10 or 20 rounds. Cards are drawn from a shuffled deck, and each card is revealed after your guess whether you are right or wrong. It is a fast, satisfying mini-game that tests your luck. How many suits can you guess correctly?`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardSuitGuessSettings),
  reducer, isTerminal, hint: (state: CardSuitGuessState): HintTarget | null => (state.phase === "reveal" ? { selector: ".bet-btn", pulses: 3 } : null), component:CardSuitGuess,
};
