import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ThreedTunnelRunnerState, ThreedTunnelRunnerAction, ThreedTunnelRunnerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ThreedTunnelRunnerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const threedTunnelRunnerPlugin: GamePlugin<ThreedTunnelRunnerState, ThreedTunnelRunnerAction, typeof settings> = {
  id:"3d-tunnel-runner", title:"3D Tunnel Runner", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"3D Tunnel Runner: endless lane-runner with neon-pulse obstacles.",
  howToPlay:"3D Tunnel Runner is an endless lane-runner. Use arrow keys, WASD, or on-screen buttons to switch between three lanes. Diamond pulses spawn from the right and approach you. One collision ends the run. Survive as long as you can — your score grows every tick.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ThreedTunnelRunnerSettings),
  reducer,isTerminal,hint: (state: ThreedTunnelRunnerState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-3d-tunnel-runner-primary"]', pulses: 3 } : null,component:ThreedTunnelRunnerGame,
};
