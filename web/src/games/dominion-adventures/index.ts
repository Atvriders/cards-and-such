import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DominionAdventuresState, DominionAdventuresAction, DominionAdventuresSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DominionAdventuresGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dominionAdventuresPlugin: GamePlugin<DominionAdventuresState, DominionAdventuresAction, typeof settings> = {
  id:"dominion-adventures",
  title:"Dominion Adventures",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Event cards and Reserve cards set aside.",
  howToPlay:"Dominion Adventures is a ten-round homage to the Adventures expansion famous for one-shot Event cards and Reserve cards stored on a tavern mat for later use. Each round, three cards reveal from a thematic Adventures deck: Reserve (3), Event (4), Traveler (5), Token (2) and Quest (6). The total of the three cards is your round score. 🎒\n\nAdventures cards range mid-value — average draws hit around 12 points per round. Across ten rounds, you can comfortably reach the 100s. Quest cards are especially valuable; pulling several Quests is a serious bonus.\n\nPress Draw to flip three cards, then Next to advance the turn, or Finish on the last round. Top players hit 130+ regularly. The game completes in well under a minute, capturing the journey-driven flavour of Adventures in a quick, easy-to-replay format with no setup needed.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DominionAdventuresSettings),
  reducer,
  isTerminal,
  component:DominionAdventuresGame,
};
