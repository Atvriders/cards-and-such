import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DungeonRollDelveState, DungeonRollDelveAction, DungeonRollDelveSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DungeonRollDelveGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DungeonRollDelveGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dungeonRollDelvePlugin: GamePlugin<DungeonRollDelveState, DungeonRollDelveAction, typeof settings> = {
  id:"dungeon-roll-delve",
  title:"Dungeon Roll Delve",
  category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll dice to slay dungeon monsters.",
  howToPlay:"Dungeon Roll Delve is a 10-round push-your-luck dice game inspired by the dungeon delve favorite. Each round, you roll three six-sided dice. Each die's face represents a Hero or Monster — you simply sum the pips, with bonus 5 if all three match (a triumphant party!). 🏰\n\nNon-matching rounds score 3-18 normally. Matching trios add 5. Across 10 rounds, expect totals between 90 and 130. The rare triple is a moment of celebration.\n\nPress Roll to descend deeper into the dungeon and reveal three dice, then Next to advance. The dice glow as they land. Score 120+ to be a true delver. Each die's value is clearly displayed. The game embodies the original Dungeon Roll's quick, decisive dice combat — finishing in well under a minute for a quick fantasy break. Push your luck — but the dice decide your fate.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DungeonRollDelveSettings),
  reducer,
  isTerminal,
    hint: (state: DungeonRollDelveState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dungeon-roll-delve-roll"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-dungeon-roll-delve-next"]', pulses: 3 };
    return null;
  },
  component:DungeonRollDelveGame,
};
