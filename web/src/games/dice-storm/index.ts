import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceStormState, DiceStormAction, DiceStormSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceStormGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceStormGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceStormPlugin: GamePlugin<DiceStormState, DiceStormAction, typeof settings> = {
  id:"dice-storm", title:"Dice Storm", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Random storms apply weather multipliers to your dice. 10 rounds.",
  howToPlay:"Dice Storm is a 10-round weather-driven dice game where each round summons a random storm: Sun (1x), Rain (2x), Lightning (3x), or Hurricane (0x). You choose Brave (face the storm with 2d6) or Shelter (safe 5 points but no multiplier).\n\nWhen you Brave, two dice are rolled and the sum is multiplied by the active storm's weather factor. Lightning under a Brave call can deliver 3×12=36 points; Hurricane wipes you to 0 even on a great roll. Sheltering always banks a flat 5 regardless of weather.\n\nTap Brave or Shelter to act. Watch the storm icon and dice resolve, then press Next to advance.\n\nA balanced run scores 60-100 points; aggressive Brave players can soar past 150 or crater near 30. Dice Storm rewards reading the weather risk and timing your shelters wisely.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceStormSettings),
  reducer,isTerminal,
  hint: (state: DiceStormState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.pool > 0) return { selector: '[data-testid="hint-target-dice-storm-bank"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-dice-storm-roll"]', pulses: 3 };
  },
  component:DiceStormGame,
};
