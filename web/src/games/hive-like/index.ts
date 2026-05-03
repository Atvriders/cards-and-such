import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HiveLikeState, HiveLikeAction, HiveLikeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HiveLikeGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HiveLikeGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const hiveLikePlugin: GamePlugin<HiveLikeState, HiveLikeAction, typeof settings> = {
  id:"hive-like", title:"Hive-like Insect Strategy", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Hive-like games where insect tiles are placed and moved.",
  howToPlay:"Hive-like Trivia is a ten-question quiz about Hive, the John Yianni-designed tile-based abstract game (published by Gen42 Games), and games inspired by it. There is no board — players play their hexagonal tiles directly onto a flat surface, building a connected 'hive'. Each tile depicts an insect with unique movement: Queen Bee (one space), Spider (exactly three), Beetle (one, climbs onto stacks), Soldier Ant (any distance), Grasshopper (jumps in straight lines), Ladybug (two on top + one off), Mosquito (mimics adjacent), Pillbug (special pushes). The first player to fully surround the opposing Queen Bee wins. Each question tests rules and insect movements. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HiveLikeSettings),
  reducer,isTerminal,hint: (state: HiveLikeState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-hive-like-answer-0"]', pulses: 3 } : null, component:HiveLikeGame,
};
