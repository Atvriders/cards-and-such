import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RedRouletteState, RedRouletteAction, RedRouletteSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RedRouletteGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const redRoulettePlugin: GamePlugin<RedRouletteState, RedRouletteAction, typeof settings> = {
  id:"red-roulette", title:"Red Roulette", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Guess if the next card will be red. 10 rounds; +10 per correct call.",
  howToPlay:`Red Roulette is the simplest card game on the menu — just predict whether the next flipped card will be red (hearts or diamonds) or black (spades or clubs). Each round you tap Red or Black; the card is revealed; if you guessed correctly, you score 10 points.

There are 10 rounds in a game. Each round is independent — the deck is freshly shuffled each time, so your odds remain a fair fifty-fifty. The maximum possible score is 100; an average run will land near 50. Six or seven correct calls counts as lucky; eight or more is bragging rights.

After each round, press Next to continue. There's nothing to memorize, no strategy to learn — just call your color, watch the card, and see whether the cards favor you today. A game lasts about a minute. Pure roulette-style fun!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RedRouletteSettings),
  reducer,isTerminal,component:RedRouletteGame,
};
