import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceQuestMiniState, DiceQuestMiniAction, DiceQuestMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceQuestMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceQuestMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceQuestMiniPlugin: GamePlugin<DiceQuestMiniState, DiceQuestMiniAction, typeof settings> = {
  id:"dice-quest-mini", title:"Dice Quest Mini", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Mini quest with dice events — 8 stages.",
  howToPlay:"Dice Quest Mini is a quick dice game with simple, satisfying scoring. Each round, two six-sided dice are rolled, and points are awarded based on the result.\n\nEven sums earn 20 + round number; odd sums earn 5. Eight stages of mini-quest fun.\n\nPress Roll to play the round, then press Next to advance. There are no choices — every game is pure variance, but watching the score climb makes it irresistible. Try to chase a personal best by replaying with different seeds.\n\nTotal score depends on how often the dice cooperate. Some rounds will pay zero, others will pay big. With multiple rounds you'll usually average something in the middle of the range — but a hot streak can push your run far higher. Roll, watch, repeat!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceQuestMiniSettings),
  reducer,
  isTerminal,
  hint: (state: DiceQuestMiniState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "roll") return { selector: '[data-testid="hint-target-dice-quest-mini-roll"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-dice-quest-mini-next"]', pulses: 3 };
    return null;
  },
  component:DiceQuestMiniGame,
};
