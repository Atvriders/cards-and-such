import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardStatueState, CardStatueAction, CardStatueSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardStatueGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardStatueGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardStatuePlugin: GamePlugin<CardStatueState, CardStatueAction, typeof settings> = {
  id:"card-statue", title:"Card Statue", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pose 12 cards as a statue. Face cards strike royal poses for points.",
  howToPlay:"Card Statue is a 12-draw card mini themed around striking poses on a marble pedestal. Each round draws a card representing the pose. Face cards (J, Q, K) and Aces strike royal, dignified poses worth 20 points. Anything below a Jack is awkward and earns 0.\\n\\nFace cards make up 4/13 of the deck (Jacks, Queens, Kings, Aces — 16 cards out of 52, ~31%), so on average about 4 of your 12 draws will be face cards. That puts the average score around 80 points. Get lucky with 6 face cards and you score 120; unlucky with just 1 and you'll only score 20.\\n\\nPress Draw to strike the next pose, then Next to assume your spot on the pedestal. There's no choice — fortune carves the statue. Compete with friends to pose the most regal collection of all. Strike a pose!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardStatueSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-statue-primary"]', pulses: 3 }), component:CardStatueGame,
};
