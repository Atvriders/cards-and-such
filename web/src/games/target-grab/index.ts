import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TargetGrabState, TargetGrabAction, TargetGrabSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TargetGrab } from "./Game.js";
const settings = { difficulty: { kind:"enum" as const, label:"Difficulty", options:["easy","hard"] as const, default:"easy" as const } } as const;
type S = SettingsOf<typeof settings>;
export const targetGrabPlugin: GamePlugin<TargetGrabState, TargetGrabAction, typeof settings> = {
  id:"target-grab", title:"Target Grab", category:"arcade",
  players:{min:1,max:1,multiplayer:false},
  description:"Click colorful targets before they disappear! Faster clicks earn bonus points.",
  howToPlay:`Target Grab is an arcade clicking game. Colorful circular targets appear at random positions on the play area. You must click them before they shrink and disappear.

Each target earns 50 base points. Clicking quickly adds a speed bonus of up to 50 extra points — red targets are freshly spawned and worth the most, while yellow targets are about to expire.

Missing a target (letting it fade out) counts as one miss. You have 3 misses (easy) before game over. Multiple targets can be on screen at once, and new ones spawn continuously.

On Hard difficulty, targets are smaller and last less time, demanding faster reactions. Click as many targets as possible to build your score. There is no time limit — the game ends only when you run out of miss allowances. How high can you score?`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TargetGrabSettings),
  reducer, isTerminal, hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-target-grab-action"]', pulses: 3 }; }, component:TargetGrab,
};
