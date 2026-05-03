import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EverdellWoodlandState, EverdellWoodlandAction, EverdellWoodlandSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const EverdellWoodlandGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.EverdellWoodlandGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const everdellWoodlandPlugin: GamePlugin<EverdellWoodlandState, EverdellWoodlandAction, typeof settings> = {
  id:"everdell-woodland",
  title:"Everdell Woodland",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Build a woodland city of cards.",
  howToPlay:"Everdell Woodland is a 10-round woodland tableau card game. Each round, three Critter or Construction cards are drawn from a fantasy deck: Mouse (1), Rabbit (2), Fox (3), Bear (5), House (4), and Tower (7). Sum their values for your round score. 🌲\n\nNo decisions — just the joy of seeing your woodland fill with critters. Average rounds score about 10 to 12. Across 10 rounds expect totals between 100 and 150. A round with three Towers (rare) scores 21.\n\nPress Draw to grow your woodland, then Next to add more residents. Critters glow earthy brown, constructions glow wood-tone. Score 130+ to be the master of Everdell. The compact display shows each card's species or building name. Inspired by the beloved fantasy worker-placement game, this miniature evokes its cozy charm in a quick run finishing in under a minute. Peaceful fantasy woodland in card form.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EverdellWoodlandSettings),
  reducer,
  isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-everdell-woodland-primary"]', pulses: 3 }),
  component:EverdellWoodlandGame,
};
