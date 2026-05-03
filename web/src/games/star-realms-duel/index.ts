import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StarRealmsDuelState, StarRealmsDuelAction, StarRealmsDuelSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const StarRealmsDuelGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.StarRealmsDuelGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const starRealmsDuelPlugin: GamePlugin<StarRealmsDuelState, StarRealmsDuelAction, typeof settings> = {
  id:"star-realms-duel",
  title:"Star Realms Duel",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Build a starship deck. Buy stations and dreadnoughts.",
  howToPlay:"Star Realms Duel is a 10-turn solo deckbuilder set in deep space. Begin with 7 Scouts (1 coin each) and 3 Outposts (1 VP each). Each turn, draw 5 cards from your shuffled deck and click Play All to total your coin.\n\nFrom the shop, buy one card: Patrol (3c gives +2c), Cruiser (6c gives +3c), Outpost (2c gives +1VP), Battlestation (5c gives +3VP), Dreadnought (8c gives +6VP). Or pass. Bought ships join the discard and shuffle back later.\n\nAfter 10 turns the fleet is scored. Every VP-bearing ship in your final deck counts; each victory point is worth 5 score points. Build economy first then load up on Battlestations / Dreadnoughts at the end. Strong fleets reach 100+ score.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StarRealmsDuelSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "play") return { selector: '[data-testid="hint-target-star-realms-duel-primary"]', pulses: 3 };
      if (state.phase === "buy") return { selector: '[data-testid="hint-target-star-realms-duel-next"]', pulses: 3 };
      return null;
    },
  component:StarRealmsDuelGame,
};
