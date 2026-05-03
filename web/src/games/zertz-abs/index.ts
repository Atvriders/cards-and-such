import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ZertzAbsState, ZertzAbsAction, ZertzAbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ZertzAbsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ZertzAbsGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const zertzAbsPlugin: GamePlugin<ZertzAbsState, ZertzAbsAction, typeof settings> = {
  id:"zertz-abs", title:"ZÈRTZ", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about ZÈRTZ, the marble-jumping abstract from the GIPF Project.",
  howToPlay:"ZÈRTZ Trivia is a ten-question quiz about ZÈRTZ, an abstract two-player strategy game by Kris Burm in the GIPF Project series. The board starts as a hexagonal arrangement of 37 white rings on which players place gray, white, or black marbles. After placing, the player removes an empty ring from the board's edge — the board shrinks. If a marble can jump another marble (Mancala-checkers style), the jump is forced and the captured marble goes into the jumping player's pool. The first player to collect a target combination of marbles wins. Each question tests rules, components, and tactics of ZÈRTZ. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ZertzAbsSettings),
  reducer,isTerminal,hint: (state: ZertzAbsState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-zertz-abs-answer-0"]', pulses: 3 } : null, component:ZertzAbsGame,
};
