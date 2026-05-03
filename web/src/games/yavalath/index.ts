import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { YavalathState, YavalathAction, YavalathSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const YavalathGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.YavalathGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const yavalathPlugin: GamePlugin<YavalathState, YavalathAction, typeof settings> = {
  id:"yavalath", title:"Yavalath", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Connect-4-by-three but 3-in-a-row loses. Place vs random CPU.",
  howToPlay:"Yavalath is a celebrated 2007 abstract designed by Cameron Browne where the first to make four-in-a-row wins, but making three-in-a-row first loses — a delicious tension that forces clever play. The original is on a hexagonal board; this 5×5 grid adaptation simplifies the gameplay.\n\nIn this compact placement version, you and a random CPU alternate placing pieces on empty squares for 14 total moves (7 each). Click any empty cell to place. The CPU plays randomly afterwards. After 14 moves or when the board fills, most pieces wins.\n\n100 points for a win, 25 for a draw, 0 for a loss. Note: this implementation simplifies the original 3-loses-4-wins logic; instead it uses majority placement. The CPU's random play often results in close games — watch for opportunities to outplace.\n\nYavalath's elegance comes from its rule paradox; this version preserves the namesake while offering quick rounds.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as YavalathSettings),
  reducer,isTerminal,component:YavalathGame,
};
