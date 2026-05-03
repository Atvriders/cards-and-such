import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GeneralaDobleState, GeneralaDobleAction, GeneralaDobleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GeneralaDobleGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.GeneralaDobleGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const generalaDoblePlugin: GamePlugin<GeneralaDobleState, GeneralaDobleAction, typeof settings> = {
  id:"generala-doble", title:"Generala Doble", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Generala variant with double-score bonuses. 8 rounds. Doubles your category score.",
  howToPlay:"Generala Doble is a Generala variant where every successful scoring roll is doubled. Like Generala Servida, you roll five dice once per round, but the values rewarded are richer — making big swings of fortune even bigger.\n\nScoring categories (all doubled): Five-of-a-kind = 100, Four-of-a-kind = 80, Full House = 60, Straight = 50, Three-of-a-kind = 40, Pair = pair-face × 4. The system always picks the best possible category for your roll.\n\nThere are 8 rounds in a game. Because the dice are evaluated automatically, the only \"play\" is the roll — but the doubled scoring sharpens the difference between a strong session and a weak one. A 5-of-a-kind in this variant is worth a full 100 points, so a single lucky throw can swing the game.\n\nAverage expected score: 200-320 points. Seek high pairs, hope for full houses, dream of the Generala Doble.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GeneralaDobleSettings),
  reducer,isTerminal,hint: (state): HintTarget | null => (state.phase === "done" ? null : { selector: '[data-testid="hint-target-generala-doble-primary"]', pulses: 3 }), component:GeneralaDobleGame,
};
