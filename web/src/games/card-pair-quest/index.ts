import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardPairQuestState, CardPairQuestAction, CardPairQuestSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardPairQuestGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardPairQuestPlugin: GamePlugin<CardPairQuestState, CardPairQuestAction, typeof settings> = {
  id:"card-pair-quest", title:"Card Pair Quest", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Find rank pairs across 12 draws. +30 each pair.",
  howToPlay:"Card Pair Quest is a 12-draw rank-matching game. Each draw flips a single random card from a fresh shuffle (cards may repeat across draws — the deck refreshes every time).\n\nThe game tracks how many of each rank (2 through Ace) you've seen. As soon as you've seen the same rank TWICE, that's a pair — and you score 30 points. Once a pair is scored, the count for that rank resets, and you start hunting it again.\n\nAcross 12 draws you can theoretically score up to 6 pairs (180 points) if every draw lined up perfectly. Realistically, with 13 ranks and only 12 draws, expect 2-4 pairs and totals in the 60-120 range. Lucky runs that converge on a few popular ranks can crack 150+; cold runs with no repeats may finish at 30 or even 0.\n\nPress Draw to flip the next card. There's no choice — pure pattern luck. Hunt those repeated ranks!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardPairQuestSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-pair-quest-primary"]', pulses: 3 }), component:CardPairQuestGame,
};
