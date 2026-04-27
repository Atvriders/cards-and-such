import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FaceFeastState, FaceFeastAction, FaceFeastSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FaceFeastGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const faceFeastPlugin: GamePlugin<FaceFeastState, FaceFeastAction, typeof settings> = {
  id:"face-feast", title:"Face Feast", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Draw 15 cards. Face cards and Aces are worth 5; numbers are worth 1.",
  howToPlay:`Face Feast is a quick card game built entirely on luck. Each draw, a single card is revealed from a shuffled deck. Number cards (2-10) score 1 point. Face cards — Jack, Queen, King — and Aces score 5 points each. Your score grows draw by draw across 15 rounds.

There's no skill or choice involved: just press Draw and watch the cards come up. The expected average score lands around 38 (since face cards plus Aces make up about 4 out of 13 ranks, contributing more than their share). Lucky games push past 50; unlucky ones can dip toward 25.

After each draw, press Next to continue. The game ends after the 15th draw and your final score is your total. It's a no-stakes, no-strategy snack of a game — perfect for when you want a feast of randomness.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FaceFeastSettings),
  reducer,isTerminal,component:FaceFeastGame,
};
