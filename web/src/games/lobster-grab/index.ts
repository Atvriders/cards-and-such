import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LobsterGrabState, LobsterGrabAction, LobsterGrabSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LobsterGrabGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const lobsterGrabPlugin: GamePlugin<LobsterGrabState, LobsterGrabAction, typeof settings> = {
  id:"lobster-grab", title:"Lobster Grab", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Grab lobsters at the right speed — match target power for big scores!",
  howToPlay:`Lobster Grab is a speed-precision arcade game. Each round a hidden target power determines ideal grab speed. Set the slider and press Grab! Points are based on proximity to target up to 100 per round. Ten rounds, 1000 max. Use diff feedback to calibrate. The closer you get every round, the bigger your final score. Become the ultimate lobster wrangler!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LobsterGrabSettings),
  reducer,isTerminal,component:LobsterGrabGame,
};
