import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardTraceState, CardTraceAction, CardTraceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardTraceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardTracePlugin: GamePlugin<CardTraceState, CardTraceAction, typeof settings> = {
  id:"card-trace", title:"Card Trace", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trace a card path: predict if next card is higher or lower than 7. 12 draws.",
  howToPlay:"Card Trace is a higher-or-lower card prediction game across 12 draws. Each round, you predict whether the next drawn card's rank will be Higher than 7 or Lower than 7. A card is drawn from a fresh 52-card deck and revealed.\n\nCards 8 through Ace beat 7 (Higher); cards 2 through 6 lose to 7 (Lower); a 7 itself is a Push and scores zero. Correct predictions earn 10 points; misses and pushes score nothing.\n\nSix ranks beat 7 and five lose to 7, so \"Higher\" has a slight statistical edge. Across 12 rounds an average run lands around 50-70 points; a careful streak can crack 100.\n\nTap Higher or Lower, watch the card flip, then press Next to advance. The card's rank and suit are shown so you can build a feel for the deck. Card Trace is fast, simple, and a clean test of probability instinct.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardTraceSettings),
  reducer, isTerminal, hint: (state: CardTraceState): HintTarget | null => ((state.phase === "predict" || state.phase === "result") ? { selector: ".rg-btn", pulses: 3 } : null), component:CardTraceGame,
};
