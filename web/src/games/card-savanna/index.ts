import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardSavannaState, CardSavannaAction, CardSavannaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardSavannaGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardSavannaPlugin: GamePlugin<CardSavannaState, CardSavannaAction, typeof settings> = {
  id:"card-savanna", title:"Card Savanna", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Collect aces (lions) on the savanna in 14 draws.",
  howToPlay:"Card Savanna is a small luck-based card game built around a single deck. Each round, you draw one card from a freshly shuffled 52-card deck and earn points based on its rank.\n\nAces (lions) score 50 points; Kings and Queens 15; everything else 3. 14 draws.\n\nThe game is brisk — there's nothing to choose besides \"Draw\" and \"Next\" — but the running total adds suspense as the rounds progress. Average runs land in the middle of the score range; lucky streaks of high or favored cards can push you well above. Replay with different seeds to see how variance treats you, and aim for a personal best by stringing together strong draws.\n\nPure variance means no two games feel the same. Tap Draw, see the card, and watch your score grow!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardSavannaSettings),
  reducer,isTerminal,component:CardSavannaGame,
};
