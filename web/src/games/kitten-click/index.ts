import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { KittenClickState, KittenClickAction, KittenClickSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KittenClickGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const kittenClickPlugin: GamePlugin<KittenClickState, KittenClickAction, typeof settings> = {
  id:"kitten-click", title:"Kitten Click", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click kittens darting across the screen. 30-second clicker.",
  howToPlay:`Kitten Click is a 30-second arcade clicker. Kittens appear in random lanes and drift across the board; tap each one before it disappears to score 10 points.

The game ticks once per beat (about every three-quarters of a second), spawning fresh kittens in random lanes. Each kitten lingers for a few ticks before vanishing — miss too many and your score suffers, since unattended kittens count toward your missed tally.

There is no skill ceiling beyond reflexes and accuracy: the more kittens you click in 30 seconds, the higher your final score. Average runs land near 200–300 points; sharpshooters routinely push past 500. The clock counts down in the top right corner — when it hits zero, the game ends and your final tally is locked in.

Mash that screen and rack up the kitten count!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as KittenClickSettings),
  reducer, isTerminal, component: KittenClickGame,
};
