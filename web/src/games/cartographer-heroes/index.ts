import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CartographerHeroesState, CartographerHeroesAction, CartographerHeroesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CartographerHeroesGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cartographerHeroesPlugin: GamePlugin<CartographerHeroesState, CartographerHeroesAction, typeof settings> = {
  id:"cartographer-heroes",
  title:"Cartographer Heroes",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Draw maps and explore territories.",
  howToPlay:"Cartographer Heroes is a 10-round map-drawing card game. Each round, three Terrain cards are drawn from a fantasy deck: Forest (3), Hills (4), Mountains (5), River (6), and Magic (8). Sum their values for your round score. 🗺️\n\nThe Magic card is rare but valuable. Average rounds score around 12 to 14. Across 10 rounds expect totals near 120 to 160.\n\nPress Draw to chart three new terrains on your fantasy map, then Next to explore further. Each terrain glows by type — green forest, gold hills, gray mountain. Score 140+ to publish a true Cartographer Heroes atlas. The game ends after 10 rounds of charting unknown lands. Inspired by the roll-and-write favorite, this card variant captures the cartographer's joy of revealing new geography in a quick run finishing in less than a minute. A peaceful fantasy mapping experience.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CartographerHeroesSettings),
  reducer,
  isTerminal,
  component:CartographerHeroesGame,
};
