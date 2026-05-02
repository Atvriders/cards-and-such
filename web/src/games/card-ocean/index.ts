import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardOceanState, CardOceanAction, CardOceanSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardOceanGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardOceanPlugin: GamePlugin<CardOceanState, CardOceanAction, typeof settings> = {
  id:"card-ocean", title:"Card Ocean", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Cards drift in the ocean. Hearts and diamonds score highest.",
  howToPlay:"Card Ocean is a small luck-based card game built around a single deck. Each round, you draw one card from a freshly shuffled 52-card deck and earn points based on its rank.\n\nHearts and diamonds (the 'red' suits) get a 10-point bonus on top of card value; spades and clubs score the rank value alone. Twelve draws.\n\nThe game is brisk — there's nothing to choose besides \"Draw\" and \"Next\" — but the running total adds suspense as the rounds progress. Average runs land in the middle of the score range; lucky streaks of high or favored cards can push you well above. Replay with different seeds to see how variance treats you, and aim for a personal best by stringing together strong draws.\n\nPure variance means no two games feel the same. Tap Draw, see the card, and watch your score grow!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardOceanSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-ocean-primary"]', pulses: 3 }), component:CardOceanGame,
};
