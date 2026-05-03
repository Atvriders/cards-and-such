import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CalLowballState, CalLowballAction, CalLowballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CalLowballGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const calLowballPlugin: GamePlugin<CalLowballState, CalLowballAction, typeof settings> = {
  id:"cal-lowball", title:"California Lowball Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo A-5 lowball; ace plays low; straights and flushes don't count.",
  howToPlay:"California Lowball Solo simulates A-5 lowball where the ace plays low and straights/flushes do not count against you. Press Deal each round to receive five cards and the engine scores how 'low' your hand is using A-5 rules.\n\nA-5 lowball scoring: A-2-3-4-5 (the wheel) is the perfect hand and scores top points. Pairs and high cards reduce your score. Nine rounds total — nine independent lowball draws.\n\nCalifornia (A-5) lowball is a classic California cardroom format: the ace always plays low, and straights/flushes are ignored. The wheel A-2-3-4-5 is the nuts. This makes lows easier to hit than in 2-7 (deuce-to-seven) lowball. Here every round draws five fresh cards and rewards the lowest possible holding. Press Next to chase wheel after wheel!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CalLowballSettings),
  reducer,isTerminal,  hint: (state: CalLowballState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-cal-lowball-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-cal-lowball-next"]', pulses: 3 };
    return null;
  },
  component:CalLowballGame,
};
