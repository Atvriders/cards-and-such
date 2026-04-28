import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardRiverState, CardRiverAction, CardRiverSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardRiverGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardRiverPlugin: GamePlugin<CardRiverState, CardRiverAction, typeof settings> = {
  id:"card-river", title:"Card River", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Flow along the river — match ranks across 12 rounds for current bonuses.",
  howToPlay:"Card River is a 12-round card mini where the flow of the river depends on rank uniformity. Each round you draw 5 cards from a fresh deck. The closer your hand is to a specific average rank, the smoother your river current — and the more points you score.\n\nYour round score equals 50 minus the absolute difference between your hand's pip-sum and a target of 35 (the median 5-card sum), capped at 0 minimum. So sums close to 35 (perhaps a 5-7-8-7-8) score well, while extreme high or low sums lose points to the rapids.\n\nPress Deal 5 each round to release your hand into the river, then Next to drift to the next bend. After 12 rounds your river journey ends. Most players average 200-300 points across the run. Smooth currents and balanced hands are the secret to a strong river-runner score.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardRiverSettings),
  reducer,isTerminal,component:CardRiverGame,
};
