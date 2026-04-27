import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PipPyramidState, PipPyramidAction, PipPyramidSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PipPyramidGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pipPyramidPlugin: GamePlugin<PipPyramidState, PipPyramidAction, typeof settings> = {
  id:"pip-pyramid", title:"Pip Pyramid", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Build a 5-card pyramid where each pip exceeds the prior. Reward valid stacks.",
  howToPlay:`Pip Pyramid challenges luck-stacking with a clean rule: each round, five cards are dealt in a row from a fresh deck. You score 20 points for every consecutive ascending pip pair (so pip[1]>pip[0], pip[2]>pip[1], etc.). If all four jumps land — a fully ascending pyramid — you score a 50-point bonus on top.

Pip values: 2 through 10 are face value; J=11; Q=12; K=13; A=14 (Ace high). The five cards arrive in dealt order, so the pyramid is whatever the deck gives you. There's no rearranging — pure luck.

There are 6 rounds. Average expected score is about 240 (40 base from random ascents per round on average, plus rare full ascents). Hitting one full ascending pyramid in a game is excellent. Hitting two is a deck love letter. Press Deal Pyramid, watch the cards land, then Next to keep stacking!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PipPyramidSettings),
  reducer,isTerminal,component:PipPyramidGame,
};
