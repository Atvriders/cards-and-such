import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SorcererCityBuildState, SorcererCityBuildAction, SorcererCityBuildSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SorcererCityBuildGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const sorcererCityBuildPlugin: GamePlugin<SorcererCityBuildState, SorcererCityBuildAction, typeof settings> = {
  id:"sorcerer-city-build",
  title:"Sorcerer City Build",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Real-time tile-drafting deckbuilder.",
  howToPlay:"Sorcerer City Build is a ten-round tableau-builder homage to Druid City Games' Sorcerer City, where players race to build the best magic city. Each round, three cards reveal from a city-themed deck: Tower (4), Market (3), Temple (5), Wall (2), Wonder (6). The three values total your round score. 🏛️\n\nThe deck averages 12 per round; Wonder pulls boost rounds to 14+. Across ten rounds expect 100 to 130 points. Repeated Wonders or Temples create dazzling totals.\n\nPress Draw to reveal three city cards, Next to keep building, and Finish on round ten. Score 120+ to claim your title as the city's master sorcerer-architect. The whole game completes in well under a minute, distilling the rapid construction frenzy of the original into a quick, repeatable, satisfying card-building experience.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SorcererCityBuildSettings),
  reducer,
  isTerminal,
  component:SorcererCityBuildGame,
};
