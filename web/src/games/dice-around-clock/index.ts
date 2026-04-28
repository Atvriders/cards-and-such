import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceAroundClockState, DiceAroundClockAction, DiceAroundClockSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceAroundClockGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceAroundClockPlugin: GamePlugin<DiceAroundClockState, DiceAroundClockAction, typeof settings> = {
  id:"dice-around-clock", title:"Dice Around the Clock Darts", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Hit each number 1-20 in order.",
  howToPlay:"Around the Clock is a darts skill drill where you must hit numbers 1, 2, 3 ... up to 20 in sequence. The first player to clock-out (hit all 20 in order) wins.\n\nIn this mini you advance through targets 1 through 20 across up to 25 rounds. Each round you Roll three dice; if any die equals the next required target (mod 6, i.e. matches the dice value pattern), you advance. Specifically: roll three dice; if max die >= current target/4, you advance one number. The exact mapping rewards both luck and patience.\n\nYour final score is your highest-cleared number times 5; clearing all 20 gives 100. Average runs end on number 12-16; a hot run clears the full clock with rounds to spare.\n\nReal Around the Clock is a gentle warm-up among pub players or a competitive race in proper sets. This mini compresses it into an enjoyable steady-progress format. Press Roll to throw, Next for the next round. Brisk, rhythmic, and satisfying as a darts-style time-killer.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceAroundClockSettings),
  reducer,isTerminal,component:DiceAroundClockGame,
};
