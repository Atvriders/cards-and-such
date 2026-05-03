import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AscensionGodslayerState, AscensionGodslayerAction, AscensionGodslayerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AscensionGodslayerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AscensionGodslayerGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const ascensionGodslayerPlugin: GamePlugin<AscensionGodslayerState, AscensionGodslayerAction, typeof settings> = {
  id:"ascension-godslayer",
  title:"Ascension Godslayer",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Build a deck of heroes and demigods. Buy victory.",
  howToPlay:"Ascension Godslayer is a compact 10-turn fantasy deckbuilder. You start with 7 Apprentices (worth 1 coin each) and 3 Heroes (worth 1 victory point each). Each turn, draw 5 cards from your shuffled deck.\n\nClick Play All to convert your hand into a coin total. Then choose one card from the shop to buy: Initiate (3c, +2c), Mage (6c, +3c), Hero (2c, +1VP), Ranger (5c, +3VP), or Champion/Demigod (8c, +6VP). Bought cards go to your discard pile and shuffle into future hands. Or pass with End Turn.\n\nAfter 10 turns, every victory card in your final deck counts. Each VP is worth 5 points. A balanced strategy of mid-cost treasures early then big victory cards late is most reliable. Final scores typically 60-150.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AscensionGodslayerSettings),
  reducer,
  isTerminal,
  hint: (state: AscensionGodslayerState): HintTarget | null => (state.phase === "play" ? { selector: '[data-testid="hint-target-ascension-godslayer-primary"]', pulses: 3 } : null),
  component:AscensionGodslayerGame,
};
