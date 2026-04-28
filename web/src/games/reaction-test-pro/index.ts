import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ReactionTestProState, ReactionTestProAction, ReactionTestProSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ReactionTestProGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const reactionTestProPlugin: GamePlugin<ReactionTestProState, ReactionTestProAction, typeof settings> = {
  id:"reaction-test-pro", title:"Reaction Test Pro", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Classic go/no-go reaction test with thirty trials.",
  howToPlay:"Reaction Test Pro is a thirty-tick classic go/no-go reaction-time test. Each round (about one second per tick), the central panel shows either a GO signal or a STOP signal. Your task: tap on GO, hold still on STOP. A correct GO tap scores ten points; a wrongful STOP tap deducts five points (minimum zero). The timer counts down thirty ticks in the upper-right corner. This is the same paradigm psychologists have used for over a century to measure simple reaction time and inhibitory control — it's a small dose of cognitive neuroscience disguised as a game. Average runs land at 80-140 points; trained reflex testers with sharp inhibition score above 200 routinely. When the thirty ticks expire, your final score is locked in. Stay calm, stay focused, react when you see GO — and never on STOP. Rack up those reaction points!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ReactionTestProSettings),
  reducer,isTerminal,component:ReactionTestProGame,
};
