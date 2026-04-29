import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TantoCuoreMaidsState, TantoCuoreMaidsAction, TantoCuoreMaidsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TantoCuoreMaidsGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const tantoCuoreMaidsPlugin: GamePlugin<TantoCuoreMaidsState, TantoCuoreMaidsAction, typeof settings> = {
  id:"tanto-cuore-maids",
  title:"Tanto Cuore Maids",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Japanese deckbuilder hiring and dispatching maids.",
  howToPlay:"Tanto Cuore Maids is a ten-round deckbuilder tribute to Arclight Games' Japanese hit Tanto Cuore, where players hire and dispatch maids around a manor. Each round, three cards reveal from a manor-themed deck: Maid (3), Senior (5), Bath (2), Town (4), Event (6). The total is added to your round score. 🎀\n\nThe deck averages 12 per round with Senior and Event cards giving big-value rounds of 14+. Bath-heavy rounds dip to 7. Across ten rounds, totals typically land between 100 and 130.\n\nPress Draw to reveal three cards, Next to dispatch the maids, and Finish on the last round. 130+ is a stellar manor. The game completes in well under a minute and distills the lighthearted set-collection flow of Tanto Cuore into a pocket-sized, easy-to-replay card-flipping session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TantoCuoreMaidsSettings),
  reducer,
  isTerminal,
  component:TantoCuoreMaidsGame,
};
