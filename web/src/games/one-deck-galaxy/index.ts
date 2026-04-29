import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OneDeckGalaxyState, OneDeckGalaxyAction, OneDeckGalaxySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OneDeckGalaxyGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const oneDeckGalaxyPlugin: GamePlugin<OneDeckGalaxyState, OneDeckGalaxyAction, typeof settings> = {
  id:"one-deck-galaxy",
  title:"One Deck Galaxy",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Sci-fi sequel to One Deck Dungeon.",
  howToPlay:"One Deck Galaxy is a ten-round sci-fi card game homage to Asmadi Games' One Deck Galaxy, the spacefaring sequel to One Deck Dungeon. Each round, three cards reveal from a galaxy-themed deck: Asteroid (2), Planet (4), Star (5), Nebula (3), Wormhole (6). The total is added to your score. 🌌\n\nThe deck averages around 12 per round; Wormhole-rich rounds break 16, while Asteroid-heavy rounds dip to 7. Across ten rounds expect 100 to 130 points. The push-your-luck of the original is replaced with the rhythm of the deck reveal.\n\nPress Draw to flip three cards, Next to traverse onward, and Finish on the last round. 130+ marks galactic mastery. The game completes in well under a minute and captures the encounter-driven flow of the original in a streamlined, satisfying pocket form.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OneDeckGalaxySettings),
  reducer,
  isTerminal,
  component:OneDeckGalaxyGame,
};
