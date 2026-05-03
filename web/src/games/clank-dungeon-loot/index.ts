import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ClankDungeonLootState, ClankDungeonLootAction, ClankDungeonLootSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ClankDungeonLootGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ClankDungeonLootGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const clankDungeonLootPlugin: GamePlugin<ClankDungeonLootState, ClankDungeonLootAction, typeof settings> = {
  id:"clank-dungeon-loot",
  title:"Clank Dungeon Loot",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Loot the dungeon — but watch the noise.",
  howToPlay:"Clank Dungeon Loot is a delicate-balance card game across 10 dungeon rounds. Each round, three loot cards are revealed: gems (worth 5), gold (worth 3), trinkets (worth 1), and dangerous Clank cards (worth 0 plus they reduce your bonus). 💎\n\nYour round score is the sum of loot values. If you reveal zero Clank cards in a round, you get a +5 silent bonus. Each Clank card cancels the bonus for that round. Across ten rounds you'll typically score around 80 to 120 points total.\n\nPress Draw to reveal the three loot cards — Clank cards glow red. Then Next to descend deeper into the dungeon. There's no choice involved; the dragon awakens or sleeps based purely on luck. Aim for 110+ to walk out of the dungeon a wealthy thief. Game ends after 10 dungeon rooms have been plundered.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ClankDungeonLootSettings),
  reducer,
  isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-clank-dungeon-loot-primary"]', pulses: 3 }),
  component:ClankDungeonLootGame,
};
