import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceTempleState, DiceTempleAction, DiceTempleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceTempleGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceTemplePlugin: GamePlugin<DiceTempleState, DiceTempleAction, typeof settings> = {
  id:"dice-temple", title:"Dice Temple", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll into the temple. Pairs score big. 10 rounds.",
  howToPlay:"Dice Temple sends you on ten ascents up the sacred steps. Each round, you roll two six-sided dice. If you roll a pair (both dice show the same number), you score the temple bonus: 20 points plus twice the pair value. So a pair of 1s = 22, a pair of 6s = 32. If the dice don't match, you score the simple sum (2 to 12).\n\nThe probability of a pair is 1/6 (about 17%), so most rounds you'll score 2-12. Average non-pair score is 7. Across 10 rounds, expected total without any pairs is around 70; with one pair, you might hit 90-95; with two pairs, 110+. Maximum is theoretical: 320 (all pairs of 6s, vanishingly rare).\n\nThere's no choice in this game — just roll, accept the dice, and hope the temple smiles. It's pure dice luck, the meditation of the random walk. Roll, score, advance, repeat.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceTempleSettings),
  reducer,isTerminal,component:DiceTempleGame,
};
