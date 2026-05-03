import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FlySwatterState, FlySwatterAction, FlySwatterSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FlySwatter } from "./Game.js";
const settings = { difficulty: { kind:"enum" as const, label:"Difficulty", options:["easy","hard"] as const, default:"easy" as const } } as const;
type S = SettingsOf<typeof settings>;
export const flySwatterPlugin: GamePlugin<FlySwatterState, FlySwatterAction, typeof settings> = {
  id:"fly-swatter", title:"Fly Swatter", category:"arcade",
  players:{min:1,max:1,multiplayer:false},
  description:"Flies are buzzing around — click them to swat! Swat 50 to win.",
  howToPlay:`Fly Swatter is an arcade game where bouncing fly dots move around the play area. Your job is to click (swat) them before they escape. Each successful swat earns 100 points.

Flies bounce off the walls and keep moving at a constant speed. On Easy difficulty there are up to 3 flies at moderate speed. On Hard there are up to 5 flies moving faster.

Swat 50 flies to complete the game and get your final score. Flies that get swatted are replaced by new ones, so the action never stops.

There is no penalty for missing a click — just keep clicking! The challenge is tracking multiple moving targets with your cursor. The flies spawn in random directions and bounce realistically off all four walls.

Your final score is 100 × flies swatted. Click as fast and accurately as you can — the faster you swat them, the higher your score!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FlySwatterSettings),
  reducer, isTerminal, hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-fly-swatter-action"]', pulses: 3 }; }, component:FlySwatter,
};
