import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BrickBashState, BrickBashAction, BrickBashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BrickBashGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BrickBashGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const brickBashPlugin: GamePlugin<BrickBashState, BrickBashAction, typeof settings> = {
  id:"brick-bash", title:"Brick Bash", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click falling bricks to bash them. 30-second clicker.",
  howToPlay:"Brick Bash is a simple 30-second arcade clicker. Bricks fall from the top of the screen in six lanes; tap each brick as fast as you can to bash it apart and score 10 points. Each brick hangs around for a few ticks before sliding off the screen.\n\nThe board ticks roughly once per second, spawning fresh bricks in random lanes. The screen can quickly fill with crumbling masonry, so practice your hand-eye coordination.\n\nThere's no skill ceiling: the more bricks you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nSmash through walls and rack up those brick points! Hard-hat optional but recommended for safety.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BrickBashSettings),
  reducer,isTerminal,
  hint: (state: BrickBashState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-brick-bash-target"]', pulses: 3 };
  },
  component:BrickBashGame,
};
