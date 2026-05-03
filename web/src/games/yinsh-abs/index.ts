import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { YinshAbsState, YinshAbsAction, YinshAbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const YinshAbsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.YinshAbsGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const yinshAbsPlugin: GamePlugin<YinshAbsState, YinshAbsAction, typeof settings> = {
  id:"yinsh-abs", title:"YINSH", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about YINSH, an abstract from the GIPF Project series.",
  howToPlay:"YINSH Trivia is a ten-question quiz about YINSH, an abstract two-player strategy game by Kris Burm and the third entry in the GIPF Project series. Each player has five rings on a hexagonal board. On a turn a player places a marker inside one of their rings, then moves the ring along a straight line — flipping any markers it passes. When five same-colored markers form a row, that player removes the row and one of their rings. The first to remove three rings wins. Each question tests rules, the GIPF Project context, and strategy of YINSH. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown. YINSH offers crystalline tactics and elegant rule-economy.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as YinshAbsSettings),
  reducer,isTerminal,hint: (state: YinshAbsState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-yinsh-abs-answer-0"]', pulses: 3 } : null, component:YinshAbsGame,
};
