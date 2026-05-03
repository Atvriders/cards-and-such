import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardBingoState, CardBingoAction, CardBingoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardBingoGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardBingoPlugin: GamePlugin<CardBingoState, CardBingoAction, typeof settings> = {
  id:"card-bingo", title:"Card Bingo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Bingo grid filled by card draws. Pick suit each round; matching suit wins.",
  howToPlay:"Card Bingo is a 5-round suit-prediction mini. Each round you call a suit (Spades, Hearts, Diamonds, or Clubs) and draw a card from a fresh 52-card deck. If your called suit matches the drawn card, you win 20 points; otherwise the round scores nothing.\n\nEach suit appears in exactly 13 of the 52 cards, so a correct call has a 25% expected win rate. With 5 rounds total, an average lucky run earns 20-40 points; a perfect 5-for-5 brings 100 points and bragging rights.\n\nTap a suit symbol on your turn to lock it in. The drawn card is revealed; if its suit matches yours, +20 points and a \"Correct\" message; otherwise zero. Press Next for the next round, or Finish on the final result.\n\nPure luck, fast turns, and a clean Bingo-style payout — Card Bingo is a perfect break for when you want quick suit-spotting fun.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardBingoSettings),
  reducer,isTerminal, hint: (state: CardBingoState): HintTarget | null => (state.phase === "predict" ? { selector: '[data-testid="hint-target-card-bingo-primary"]', pulses: 3 } : null),component:CardBingoGame,
};
