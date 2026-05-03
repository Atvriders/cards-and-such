import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MunchkinMiniState, MunchkinMiniAction, MunchkinMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MunchkinMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MunchkinMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const munchkinMiniPlugin: GamePlugin<MunchkinMiniState, MunchkinMiniAction, typeof settings> = {
  id:"munchkin-mini",
  title:"Munchkin Mini",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Kick down doors, fight monsters, level up.",
  howToPlay:"Munchkin Mini is a comedic 10-round card combat game. Each round you kick down a door and draw two cards: a Hero strength (worth 2-9) and a Monster strength (worth 1-10). If your Hero strength is higher, you defeat the monster and score points equal to the gap plus your current level. If lower, you score zero and don't level up. 🐉\n\nYou level up by 1 each victory, capped at 10. So later wins are worth more. Tying loses (in true Munchkin tradition). Expect 5 to 8 wins per game; total score typically lands 30 to 60.\n\nPress Draw to reveal the encounter; then Next to advance. Heroes glow blue, monsters red. Score 50+ to be a Munchkin champion. Each round shows your level in the corner. The game blends silly fantasy combat with a touch of strategy and luck — finishing in well under a minute for a quick comedic break.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MunchkinMiniSettings),
  reducer,
  isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-munchkin-mini-primary"]', pulses: 3 }),
  component:MunchkinMiniGame,
};
