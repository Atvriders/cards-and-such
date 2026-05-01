import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MysticValeCraftState, MysticValeCraftAction, MysticValeCraftSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MysticValeCraftGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const mysticValeCraftPlugin: GamePlugin<MysticValeCraftState, MysticValeCraftAction, typeof settings> = {
  id:"mystic-vale-craft",
  title:"Mystic Vale Craft",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Cultivate a forest deck. Buy glades and groves.",
  howToPlay:"Mystic Vale Craft is a serene 10-turn deckbuilder. Begin with 7 Saplings (1 coin) and 3 Glades (1 VP). Each turn draws 5 cards from your shuffled deck.\n\nClick Play All to total your coin. Spend it in the shop on one card: Sprout (3c, +2c), Bloom (6c, +3c), Glade (2c, +1VP), Grove (5c, +3VP), Sanctuary (8c, +6VP). Bought cards go to discard and reshuffle.\n\nAfter 10 turns the vale is tallied. Every VP-bearing card in your deck counts; each victory point is worth 5 score points. Strong gardens reach 100+ score. Build economy first, then plant Groves and a Sanctuary as the season closes.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MysticValeCraftSettings),
  reducer,
  isTerminal,
  component:MysticValeCraftGame,
};
