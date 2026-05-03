import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NinjaWallArcadeState, NinjaWallArcadeAction, NinjaWallArcadeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NinjaWallArcadeGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const ninjaWallArcadePlugin: GamePlugin<NinjaWallArcadeState, NinjaWallArcadeAction, typeof settings> = {
  id:"ninja-wall-arcade", title:"Ninja Wall", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Ninja Wall-jumping climber arcade games.",
  howToPlay:"Ninja Wall Trivia is a ten-question quiz about Ninja Wall and similar wall-jumping climber arcade games (Ninja Up!, Wall Jump, etc.). The protagonist clings to one of two opposing walls and tap to leap to the other. The walls scroll downward (player climbs upward) and obstacles like spikes, blades, and enemies appear on each wall. The player times jumps to avoid obstacles and chains successful jumps for high scores. Each question tests genre conventions, famous titles, and history. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NinjaWallArcadeSettings),
  reducer,isTerminal,hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-ninja-wall-arcade-action"]', pulses: 3 }; }, component:NinjaWallArcadeGame,
};
