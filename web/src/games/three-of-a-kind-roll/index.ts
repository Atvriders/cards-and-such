import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ThreeOfAKindRollState, ThreeOfAKindRollAction, ThreeOfAKindRollSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ThreeOfAKindRoll = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ThreeOfAKindRoll as unknown as React.ComponentType<unknown> })));
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["5","10"] as const, default:"5" as const } } as const;
type S = SettingsOf<typeof settings>;
export const threeOfAKindRollPlugin: GamePlugin<ThreeOfAKindRollState, ThreeOfAKindRollAction, typeof settings> = {
  id:"three-of-a-kind-roll", title:"Three of a Kind Roll", category:"dice",
  players:{min:1,max:1,multiplayer:false},
  description:"Roll 3 dice up to 3 times to get three matching faces. Score more by getting it sooner!",
  howToPlay:`Three of a Kind Roll challenges you to roll three matching dice faces. Each round you get up to three attempts. Your goal is to have all three dice show the same number.

On each attempt you can click dice to mark them as "kept" (useful if two already match), then click Reroll to re-roll the others. Or click Score Now to immediately score your current dice.

Scoring rewards speed: three of a kind on the first roll earns 500 points, on the second roll 300 points, and on the third roll 100 points. If you use all three attempts without getting three of a kind, you score zero.

The probability of rolling three of a kind is 1/36 on the first try. By keeping pairs and rerolling singles, you can improve your odds significantly. Use Settings to play 5 or 10 rounds. Maximum possible score is 2500 pts (all first-roll threes in 5 rounds). Good luck!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ThreeOfAKindRollSettings),
  reducer, isTerminal,
  hint: (state: any) => {
    if ((state as any).phase === "gameover") return null;
    if ((state as any).phase === "result") return { selector: '[data-testid="hint-target-three-of-a-kind-roll-next"]', pulses: 3 };
    if ((state as any).gotThree || ((state as any).attempts === ((state as any).maxAttempts - 1))) {
      return { selector: '[data-testid="hint-target-three-of-a-kind-roll-bank"]', pulses: 3 };
    }
    return { selector: '[data-testid="hint-target-three-of-a-kind-roll-roll"]', pulses: 3 };
  },
  component:ThreeOfAKindRoll,
};
