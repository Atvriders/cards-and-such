import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SeasonsElementalState, SeasonsElementalAction, SeasonsElementalSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SeasonsElementalGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SeasonsElementalGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: SeasonsElementalState): HintTarget | null => (state.phase === "rolling" ? { selector: ".dm-btn", pulses: 3 } : null);

export const seasonsElementalPlugin: GamePlugin<SeasonsElementalState, SeasonsElementalAction, typeof settings> = {
  id:"seasons-elemental",
  title:"Seasons Elemental",
  category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll elemental dice across seasons.",
  howToPlay:"Seasons Elemental is a 10-round elemental dice game inspired by the fantasy tableau-builder. Each round, you roll four custom dice. Each face represents an element: 1=Air, 2=Water, 3=Fire, 4=Earth, 5=Crystal, 6=Wild. Sum all four for the base round score. 🍂\n\nIf you roll any matching pair (a seasonal harmony), bonus +3. Two pairs (full harmony): +8. Across 10 rounds expect totals between 130 and 180.\n\nPress Roll to spin the elemental dice, then Next to advance to the next season. Matching dice glow purple. The compact display shows each die's value and element. Score 160+ to master Seasons Elemental. The game embodies the original's elegant elemental rolling in a brisk fantasy run finishing in well under a minute. Each round its own little revelation of fire, water, earth, air, and crystal. A miniature ode to elemental fantasy magic.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SeasonsElementalSettings),
  reducer, isTerminal, hint: hint, component:SeasonsElementalGame,
};
