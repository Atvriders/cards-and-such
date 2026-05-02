import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardCliffState, CardCliffAction, CardCliffSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardCliffGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardCliffPlugin: GamePlugin<CardCliffState, CardCliffAction, typeof settings> = {
  id:"card-cliff", title:"Card Cliff", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Cards descend a cliff — aim for the lowest-rank cards in 12 draws.",
  howToPlay:"Card Cliff is a small luck-based card game built around a single deck. Each round, you draw one card from a freshly shuffled 52-card deck and earn points based on its rank.\n\nLower-ranked cards score more, mimicking a descent down a cliff. Twos pay the most (70 pts) and aces the least (10). Twelve draws total.\n\nThe game is brisk — there's nothing to choose besides \"Draw\" and \"Next\" — but the running total adds suspense as the rounds progress. Average runs land in the middle of the score range; lucky streaks of high or favored cards can push you well above. Replay with different seeds to see how variance treats you, and aim for a personal best by stringing together strong draws.\n\nPure variance means no two games feel the same. Tap Draw, see the card, and watch your score grow!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardCliffSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-cliff-primary"]', pulses: 3 }), component:CardCliffGame,
};
