import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardCollectorState, CardCollectorAction, CardCollectorSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardCollectorGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardCollectorPlugin: GamePlugin<CardCollectorState, CardCollectorAction, typeof settings> = {
  id:"card-collector", title:"Card Collector", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Each round, collect cards of a target SUIT. 4 rounds × 8 draws.",
  howToPlay:`Card Collector is a brisk 4-round suit-matching game. Each round, you're given a target suit (Spades, Hearts, Diamonds, or Clubs) and you draw 8 random cards. Each card matching the target suit scores +5 points. After all 8 draws, your round score is locked and the next round begins with a fresh target suit.

There are 4 rounds total — one per suit, randomly ordered. You'll see the target suit prominently at the top of the screen along with your current score and the round number. Tap Draw to draw the next card; the cycle repeats automatically until 8 cards are drawn.

Maximum score is 160 (8 hits × 4 rounds × 5 pts). Average expected score is around 40 (random matches at 1/4 chance). The fun is the streaks — runs of 3 or 4 hits in a single round are exhilarating, even if completely random.

A simple, low-stakes card-spotting filler. Perfect when you want a quick palate cleanser between bigger games!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardCollectorSettings),
  reducer, isTerminal, hint: (state: CardCollectorState): HintTarget | null => (state.phase !== "done" ? { selector: ".col-btn", pulses: 3 } : null), component:CardCollectorGame,
};
