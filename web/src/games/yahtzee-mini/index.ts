import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { YahtzeeMiniState, YahtzeeMiniAction, YahtzeeMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { YahtzeeMiniGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const yahtzeeMiniPlugin: GamePlugin<YahtzeeMiniState, YahtzeeMiniAction, typeof settings> = {
  id:"yahtzee-mini", title:"Yahtzee Mini", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"3 rolls of 5 dice; score combos. 6 rounds.",
  howToPlay:`Yahtzee Mini is a stripped-down 6-round dice combo chaser. Each round you start with five dice already rolled and have up to two rerolls. Click any die to toggle its 'hold' status (asterisk shown), then press Roll to re-roll the unheld dice. When you're satisfied, press Score to lock in your combo.

Combo points: 5-of-a-kind = 80, 4-of-a-kind = 40, full house (3+2) = 25, 3-of-a-kind = 20, two pair = 15, pair = 10, otherwise floor of (sum / 2). The reroll mechanic gives you control to chase a target — get four matching dice and reroll the odd one out for a shot at five-of-a-kind!

You play 6 rounds. A typical careful run lands at 90–140 points; pushing toward 200 means you nailed several combos. Hold smart and roll often!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as YahtzeeMiniSettings),
  reducer,isTerminal,component:YahtzeeMiniGame,
};
