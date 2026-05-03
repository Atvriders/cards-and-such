import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ParityPopState, ParityPopAction, ParityPopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ParityPopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ParityPopGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const parityPopPlugin: GamePlugin<ParityPopState, ParityPopAction, typeof settings> = {
  id:"parity-pop", title:"Parity Pop", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Predict if the next die will roll even or odd. 12 rounds; +8 each correct.",
  howToPlay:`Parity Pop is the simplest dice prediction game on the menu. Each round, you predict whether a single six-sided die will roll Even (2, 4, or 6) or Odd (1, 3, or 5). Then the die is rolled and revealed; if you guessed correctly, you score 8 points.

There are 12 rounds in a game. Each side has exactly three faces of the die, so your odds are a clean 50/50 every round. The maximum score is 96 points; an average run lands near 48. Hit 64 (8 correct) and the dice are smiling on you. Twelve correct in a row would max out at 96 — about a 1-in-4096 chance.

Press Even or Odd to commit your prediction. The die rolls, the result shows, you score (or you don't), and you press Next. Quick, casual, and oddly satisfying — perfect for a coffee-break diversion.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ParityPopSettings),
  reducer,isTerminal,component:ParityPopGame,
  hint: (state: ParityPopState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "predict") return { selector: '[data-testid="hint-target-paritypop-predict"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-paritypop-next"]', pulses: 3 };
    return null;
  },
};
