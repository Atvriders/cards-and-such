import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceMineState, DiceMineAction, DiceMineSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceMineGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceMineGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceMinePlugin: GamePlugin<DiceMineState, DiceMineAction, typeof settings> = {
  id:"dice-mine", title:"Dice Mine", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Mine ore with four dice. Each pip is a chunk; high faces are gold.",
  howToPlay:"Dice Mine is a 10-round dice mini themed around an underground ore mine. Each round, you swing the pickaxe with four dice. Each die scores depending on what struck:\\n\\n- A 1 is a flake of pure gold worth 10 points.\\n- 5 or 6 is a chunk of ore worth 5 points each.\\n- 2, 3, 4 strike rock and score nothing.\\n\\nPress Mine to swing the pickaxe and roll the dice, see your haul, then press Next to descend deeper into the mine. There's no choice or skill — the rock yields what it yields.\\n\\nExpected average per die is about 3.3 points (1/6 × 10 + 2/6 × 5 = ~3.3), so over 4 dice and 10 rounds you'll average about 130 points. Strike a rich vein with several 1s and 5/6s and you can hit 200+. Dig deep!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceMineSettings),
  reducer,
  isTerminal,
  hint: (state: DiceMineState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "roll") return { selector: '[data-testid="hint-target-dice-mine-roll"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-dice-mine-next"]', pulses: 3 };
    return null;
  },
  component:DiceMineGame,
};
