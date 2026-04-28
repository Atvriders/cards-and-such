import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardCanyonState, CardCanyonAction, CardCanyonSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardCanyonGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardCanyonPlugin: GamePlugin<CardCanyonState, CardCanyonAction, typeof settings> = {
  id:"card-canyon", title:"Card Canyon", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Depth equals score — the deeper your hand, the bigger the points.",
  howToPlay:"Card Canyon is a 12-round mini where depth is measured by total pip value. Unlike Card Mountain (where lower sums win), in Card Canyon higher sums dig deeper into the canyon — and the deeper you go, the more points you score.\n\nEach round you draw 5 cards from a fresh deck. Your round score equals the pip sum directly, capped at 65 maximum. Aces count as 1 (shallow), face cards count as 11/12/13 (deep). A hand of 5 face-card values can hit the 65-point cap easily; a hand of low spots scores modestly.\n\nPress Deal 5 to descend each round, then Next to dig deeper. After 12 rounds your canyon depth is final. Average expected sum is about 35 per hand (~35 points), so typical runs land near 380-450 points. Hit big-card hands repeatedly to push past 600. The Canyon rewards bold, heavy draws.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardCanyonSettings),
  reducer,isTerminal,component:CardCanyonGame,
};
