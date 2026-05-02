import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QueensQuestState, QueensQuestAction, QueensQuestSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QueensQuestGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const queensQuestPlugin: GamePlugin<QueensQuestState, QueensQuestAction, typeof settings> = {
  id:"queens-quest", title:"Queens Quest", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Score by drawing queens; +100 per queen across 10 random 5-card draws.",
  howToPlay:"Queens Quest is a simple, breezy card mini. Each round, you press Deal and get five fresh cards from a random deck. Every Queen in your hand is worth 100 points \u2014 and there are only four Queens in a 52-card deck, so each one is a welcome sight.\n\nYou play 10 draws total. With 4 queens in 52 cards and 5 cards per round, on average you'll catch about 0.38 queens per hand, so a typical game ends near 300 points \u2014 but multi-queen hands are the dream and can dramatically boost your final score. Matched queens are highlighted gold for easy spotting.\n\nNo strategy, no decisions \u2014 just press Deal, watch the cards land, and cheer the queens. After 10 rounds your final tally is locked in. Long live the queens!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as QueensQuestSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-queens-quest-primary"]', pulses: 3 }),component:QueensQuestGame,
};
