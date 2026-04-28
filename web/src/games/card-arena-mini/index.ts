import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardArenaMiniState, CardArenaMiniAction, CardArenaMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardArenaMiniGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardArenaMiniPlugin: GamePlugin<CardArenaMiniState, CardArenaMiniAction, typeof settings> = {
  id:"card-arena-mini", title:"Card Arena Mini", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Card-duel arena — face cards win!",
  howToPlay:`Card Arena Mini is a quick card duel game. Over 8 rounds, you draw a single card from the deck. Face cards (Jack, Queen, King, Ace) are the gladiators in the arena and score 15 points each. Number cards (2 through 10) lose the duel and score 0.

Press Draw Card each round to reveal the gladiator. The maximum possible score is 8 × 15 = 120 if every draw is a face card, but with only 16 face cards in a deck of 52 (about 30.8%), you can expect roughly 2-3 face cards per game on average — yielding 30-45 points typically.

There are no decisions to make. The deck shuffles at the start, and you simply draw your way through 8 cards. Each face card is a victory cheer; each pip card is a missed swing. Step into the arena!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardArenaMiniSettings),
  reducer,isTerminal,component:CardArenaMiniGame,
};
