import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CitadelPatState, CitadelPatAction, CitadelPatSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CitadelPatGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const citadelPatPlugin: GamePlugin<CitadelPatState, CitadelPatAction, typeof settings> = {
  id:"citadel-pat", title:"Citadel Patience", category:"solitaire",
  players:{ min:1, max:1, multiplayer:false },
  description:"Beleaguered Castle variant where the stock pre-fills foundations.",
  howToPlay:"Citadel Patience is a ten-round solitaire micro-variant inspired by Citadel Patience: stock pre-fills; castle build. Each round you receive a fresh five-card hand drawn from a single seeded 52-card deck. You then choose one of three actions: Keep & Score locks the visible hand and awards points based on face cards, pairs, ascending runs, and same-suit flushes; Discard Hand abandons the hand for a flat one-point consolation and rolls into the next round; and Swap consumes the next card from the deck to replace any single card in the hand without ending the round.\n\nScores compound across all ten rounds. A typical run lands somewhere between 40 and 120 total points; sharp swap usage and well-timed Keeps can push past that. The game ends automatically when ten rounds are reached or the deck is exhausted, and your final score is rated Pass, Fair, Good, or Excellent depending on the total earned.\n\nThe deal is fully seeded, so the same starting seed always produces an identical card sequence for fair comparison and replay.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CitadelPatSettings),
  reducer,isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component:CitadelPatGame,
};
