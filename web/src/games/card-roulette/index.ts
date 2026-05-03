import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardRouletteState, CardRouletteAction, CardRouletteSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardRouletteGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardRoulettePlugin: GamePlugin<CardRouletteState, CardRouletteAction, typeof settings> = {
  id:"card-roulette", title:"Card Roulette", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Bet on next card category: Red, Black, Face card, or Number card.",
  howToPlay:"Card Roulette is a casino-style card category bet across 12 spins. Each round you place a bet on what the next drawn card will be: Red (hearts/diamonds), Black (spades/clubs), Face (J/Q/K), or Number (2 through 10). Aces count as Number.\n\nReds and Blacks each cover 26 of 52 cards (50% odds, +10 pts on win). Face cards cover 12 cards (23% odds, +20 pts on win). Numbers cover 40 cards (77% odds, +5 pts on win). The expected value across categories is similar — pick your style of risk.\n\nTap a category to lock it in. The drawn card is revealed; if it satisfies your bet, you score; otherwise zero. Press Next to advance.\n\nA typical run lands 50-90 points. Card Roulette mixes color betting with face-card hunting — a fast, tactical card mini-game.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardRouletteSettings),
  reducer, isTerminal, hint: (state: CardRouletteState): HintTarget | null => ((state.phase === "predict" || state.phase === "result") ? { selector: ".rg-btn", pulses: 3 } : null), component:CardRouletteGame,
};
