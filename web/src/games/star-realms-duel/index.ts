import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StarRealmsDuelState, StarRealmsDuelAction, StarRealmsDuelSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StarRealmsDuelGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const starRealmsDuelPlugin: GamePlugin<StarRealmsDuelState, StarRealmsDuelAction, typeof settings> = {
  id:"star-realms-duel",
  title:"Star Realms Duel",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Star ship duel via card draws.",
  howToPlay:"Star Realms Duel is a 10-round dueling card game between you and a faction nemesis. Each round, both you and the opponent draw two cards from a deck of fantasy starship factions valued 1 to 8. Highest sum wins the round and scores points equal to the difference. 🚀\n\nTies score zero for both. Your decisions are minimal — the suspense is in the draw. Higher cards represent dreadnoughts; lower ones are scouts. Across ten rounds, you'll typically score about 20 to 30 points total against an evenly matched opponent.\n\nPress Draw to reveal both hands. Then Next to continue. Watch your running score climb in green and the rival's in red — you only score the spread on rounds you win. Aim for 35 or more to call yourself a Star Realms champion. Quick, dramatic, and entirely luck-driven.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StarRealmsDuelSettings),
  reducer,
  isTerminal,
  component:StarRealmsDuelGame,
};
