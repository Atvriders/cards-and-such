import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HooliganDiceState, HooliganDiceAction, HooliganDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HooliganDiceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const hooliganDicePlugin: GamePlugin<HooliganDiceState, HooliganDiceAction, typeof settings> = {
  id:"hooligan-dice", title:"Hooligan Dice", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"English 5-dice bar game. Score by rounds 1-6 then bonus. 8 rounds.",
  howToPlay:"Hooligan Dice is an English five-dice bar game where you score by rolling specific numbers each round in sequence. Round 1 you score 1s, round 2 you score 2s, and so on through 6, with bonus rounds afterward.\n\nIn this 8-round version, you roll five dice once per round. Rounds 1-6 use standard target-number scoring: each die showing the round number = round-number × 10 points. Rounds 7-8 are bonus rounds: round 7 = sum of all dice × 2, round 8 = top-pair score (highest pair × 30).\n\n8 rounds total. Average expected score: 100-200 points. The early rounds (1, 2) score lower per match but are easier to hit; late target rounds (5, 6) pay higher but require luck.\n\nA traditional pub favorite, here distilled into solo single-roll fun. Hooligans the lot of them, but lovely dice.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HooliganDiceSettings),
  reducer,isTerminal,component:HooliganDiceGame,
};
