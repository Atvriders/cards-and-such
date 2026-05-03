import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DoomlingsCatastropheState, DoomlingsCatastropheAction, DoomlingsCatastropheSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DoomlingsCatastropheGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DoomlingsCatastropheGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const doomlingsCatastrophePlugin: GamePlugin<DoomlingsCatastropheState, DoomlingsCatastropheAction, typeof settings> = {
  id:"doomlings-catastrophe",
  title:"Doomlings Catastrophe",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Survive escalating doom each round.",
  howToPlay:"Doomlings Catastrophe is a 10-round survival card game. Each round, three Doomling cards (worth 2-7) are drawn, plus one Catastrophe card (worth 1-6). Your round score is the sum of Doomling values minus the Catastrophe value. Catastrophes can drop you to zero but never negative — survive them. ☄️\n\nSome rounds the Catastrophe is mild; others wipe out most of your gain. Average rounds score around 8 points after damage. Across 10 rounds expect totals from 60 to 110. Streaks of low Catastrophes can lead to thrilling runs.\n\nPress Draw to face the doom, then Next to continue. Doomlings glow gold; Catastrophes glow red. Score 90+ to outlast the apocalypse. Each card shows its name and value clearly. Brings the doom-themed deckbuilder vibe into a quick fantasy run finishing in well under a minute.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DoomlingsCatastropheSettings),
  reducer,
  isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-doomlings-catastrophe-primary"]', pulses: 3 }),
  component:DoomlingsCatastropheGame,
};
