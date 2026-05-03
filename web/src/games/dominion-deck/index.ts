import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DominionDeckState, DominionDeckAction, DominionDeckSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DominionDeckGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DominionDeckGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dominionDeckPlugin: GamePlugin<DominionDeckState, DominionDeckAction, typeof settings> = {
  id:"dominion-deck",
  title:"Dominion Deck",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Build a deck. Buy victory cards. Win the kingdom.",
  howToPlay:"Dominion Deck is a 10-turn solo deckbuilder homaging Donald X. Vaccarino's classic. You start with 7 Coppers (1 coin) and 3 Estates (1 VP). Each turn, 5 cards are drawn from your shuffled deck.\n\nClick Play All Treasures to convert your hand into a coin total. From the shop, buy ONE card: Silver (3c, +2c), Gold (6c, +3c), Estate (2c, +1VP), Duchy (5c, +3VP), Province (8c, +6VP). Or pass and End Turn. Bought cards go to your discard and reshuffle when the deck runs out.\n\nAfter 10 turns, every victory-card in your final deck (deck + discard + hand + played + last bought) is tallied. Each victory point is worth 5 score points. Strong games score 70-160. Buy treasures early, pivot to Provinces and Duchies once you can afford them.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DominionDeckSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "play") return { selector: '[data-testid="hint-target-dominion-deck-primary"]', pulses: 3 };
      if (state.phase === "buy") return { selector: '[data-testid="hint-target-dominion-deck-next"]', pulses: 3 };
      return null;
    },
  component:DominionDeckGame,
};
