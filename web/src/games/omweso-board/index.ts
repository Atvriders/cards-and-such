import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OmwesoBoardState, OmwesoBoardAction, OmwesoBoardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const OmwesoBoardGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.OmwesoBoardGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const omwesoBoardPlugin: GamePlugin<OmwesoBoardState, OmwesoBoardAction, typeof settings> = {
  id:"omweso-board", title:"Omweso", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Omweso, the four-row Ugandan mancala variant.",
  howToPlay:"Omweso Trivia is a ten-question quiz about Omweso, a traditional Ugandan mancala game played on a board of 4 rows × 8 pits (32 pits total). Each player controls two adjacent rows. The game uses 64 seeds (or stones), and the player sows seeds counterclockwise, with the option of relays — when the last seed lands in an occupied pit, the player picks up all those seeds and continues sowing. Captures occur when a player's last seed lands in their own pit, the opposite enemy pit is non-empty, and on certain board configurations. Each question tests rules and history of Omweso. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OmwesoBoardSettings),
  reducer,isTerminal,hint: (state: OmwesoBoardState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-omweso-board-answer-0"]', pulses: 3 } : null, component:OmwesoBoardGame,
};
