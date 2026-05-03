import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DunkTankState, DunkTankAction, DunkTankSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DunkTank } from "./Game.js";
const settings = { balls: { kind:"enum" as const, label:"Balls", options:["5","10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const dunkTankPlugin: GamePlugin<DunkTankState, DunkTankAction, typeof settings> = {
  id:"dunk-tank", title:"Dunk Tank", category:"arcade",
  players:{min:1,max:1,multiplayer:false},
  description:"Hit the moving target to dunk the person! Time your throw as it slides left and right.",
  howToPlay:`Dunk Tank is a classic carnival game. A target platform slides left and right across the screen. Click anywhere to throw a ball — the horizontal position of your click determines where the ball lands.

Hit the target to score! Direct hits earn 100 points plus up to 50 bonus for hitting the center. Each game you get 5 or 10 balls (configurable in Settings). After each throw the target resets to a new starting position.

The target moves faster and farther as the game progresses, challenging you to time each throw precisely. Watch the target's movement rhythm — throw ahead of it or wait for it to come back to center.

After all balls are thrown, your final score and dunk count are shown. A perfect game would dunk every time! With 10 balls and perfect accuracy you could score 1500 points. Can you read the target's movement and land every throw?`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DunkTankSettings),
  reducer, isTerminal, 
  hint: (s: any) => { const p = (s as any)?.phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any)?.gameOver === true || (s as any)?.done === true) return null; return { selector: ".arcade-wrap svg", pulses: 3 }; },
  component:DunkTank,
};
