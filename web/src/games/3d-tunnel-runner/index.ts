import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ThreedTunnelRunnerState, ThreedTunnelRunnerAction, ThreedTunnelRunnerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ThreedTunnelRunnerGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const threedTunnelRunnerPlugin: GamePlugin<ThreedTunnelRunnerState, ThreedTunnelRunnerAction, typeof settings> = {
  id:"3d-tunnel-runner", title:"3D Tunnel Runner", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about 3D tunnel runner endless arcade games.",
  howToPlay:"3D Tunnel Runner Trivia is a ten-question quiz about 3D tunnel runner arcade games — endless games where the player flies down or runs through a tunnel that often rotates around them. Examples include Subway Surfers, Tube, and various rhythm-based tunnel runners. The player typically tilts, taps, or swipes to switch lanes (often three) and dodge obstacles. The tunnel often loops or rotates, providing dramatic visuals. Each question tests history, mechanics, and famous titles in the 3D tunnel runner genre. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown. Tunnel runners turned simple lane-switching into hypnotic, vertigo-inducing fun.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ThreedTunnelRunnerSettings),
  reducer,isTerminal,component:ThreedTunnelRunnerGame,
};
