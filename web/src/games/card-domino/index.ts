import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardDominoState, CardDominoAction, CardDominoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardDominoGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardDominoPlugin: GamePlugin<CardDominoState, CardDominoAction, typeof settings> = {
  id:"card-domino", title:"Card Domino", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Lay cards as dominoes: each card must match the previous rank or be one off.",
  howToPlay:`Card Domino plays cards from your hand like dominoes onto a chain. Your hand is a random set of cards (Aces low, Kings high). On each turn you have two choices: play a card from the hand, or skip (lose 2 points and burn a turn).

The matching rule is simple: each played card must equal the previous card's rank or be exactly one off (e.g., a 7 can follow a 6, 7, or 8). The very first card is always legal. The wrap from King back to Ace is NOT allowed — they're 13 apart.

Scoring: each legal play earns 12 points; an attempted illegal play loses 3 points but doesn't extend the chain (the card is discarded and your turn count advances). Skips lose 2.

You get 12 plays total, win or lose, then the game ends. The maximum theoretical score is 144 (12 × 12). A long chain of equal-rank or stair-step cards is the path to glory.

Skip wisely — preserving a strong card may pay off later.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardDominoSettings),
  reducer, isTerminal,
  hint: (state: any) => {
      if (state.phase === "done") return null;
      return { selector: '[data-testid="hint-target-card-domino-skip"]', pulses: 3 };
    }, component: CardDominoGame,
};
