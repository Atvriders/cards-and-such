import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OwlHootState, OwlHootAction, OwlHootSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OwlHootGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const owlHootPlugin: GamePlugin<OwlHootState, OwlHootAction, typeof settings> = {
  id:"owl-hoot", title:"Owl Hoot", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click hooting owls perched in moonlit trees. 25-second clicker.",
  howToPlay:"Owl Hoot is a 25-second nighttime forest clicker. Owls perch silently in six lanes of moonlit trees — tap each one to \"hoot\" it before it flies off, scoring 10 points apiece.\n\nThe game ticks once per second, spawning new owls at random lanes. Each owl perches for a few ticks before fluttering away, so reaction speed and aim are everything.\n\nThere's no skill ceiling beyond your reflexes. Average runs total 150-250 points (the timer is 25 seconds, slightly shorter than other forest clickers). Sharpshooters pushing 400+ are showing real night-owl reflexes.\n\nTip: the dark-blue night background makes owls easier to spot in the lighter spots between trees. Watch the whole canopy at once and prioritize the longest-perched owls first. The clock counts down in the top right; at zero, your final score locks. Hoot away! Pretty soon, you'll be the wisest hooter in the woods.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OwlHootSettings),
  reducer,isTerminal,component:OwlHootGame,
};
