import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CutTheDeckState, CutTheDeckAction, CutTheDeckSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CutTheDeckGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cutTheDeckPlugin: GamePlugin<CutTheDeckState, CutTheDeckAction, typeof settings> = {
  id:"cut-the-deck", title:"Cut the Deck", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Predict if the cut card is over or under 7. 12 rounds; +10 per correct call.",
  howToPlay:`Cut the Deck is a quick over-under prediction card mini. Each round, you predict whether the next cut card's rank will be Over 7 or Under 7. Press Over 7 or Under 7 to lock your call; the card flips, and if you guessed correctly, you score 10 points.

A card of rank exactly 7 is a Push — neither side wins, no points are awarded for that round. With 13 ranks (2 through Ace high), the math heavily favors any non-7 result: Under 7 has 5 winning ranks (2-6) and Over 7 has 6 winning ranks (8-A) — so Over is mathematically slightly stronger, hitting roughly 46% to Under's 38%, with 7s landing 8% of the time as pushes.

There are 12 rounds total. Average expected score is around 50 points; great runs can hit 80+. Press Next after each result to continue.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CutTheDeckSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-cut-the-deck-primary"]', pulses: 3 }),component:CutTheDeckGame,
};
