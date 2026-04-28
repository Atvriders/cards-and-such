import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardJungleState, CardJungleAction, CardJungleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardJungleGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardJunglePlugin: GamePlugin<CardJungleState, CardJungleAction, typeof settings> = {
  id:"card-jungle", title:"Card Jungle", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Navigate a jungle of cards. Face cards reward you most.",
  howToPlay:"Card Jungle is a small luck-based card game built around a single deck. Each round, you draw one card from a freshly shuffled 52-card deck and earn points based on its rank.\n\nFace cards (Jack, Queen, King) score 30 points each, aces 20, and number cards just 5. Twelve draws — find face cards in the jungle.\n\nThe game is brisk — there's nothing to choose besides \"Draw\" and \"Next\" — but the running total adds suspense as the rounds progress. Average runs land in the middle of the score range; lucky streaks of high or favored cards can push you well above. Replay with different seeds to see how variance treats you, and aim for a personal best by stringing together strong draws.\n\nPure variance means no two games feel the same. Tap Draw, see the card, and watch your score grow!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardJungleSettings),
  reducer,isTerminal,component:CardJungleGame,
};
