import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceCircusState, DiceCircusAction, DiceCircusSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceCircusGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceCircusPlugin: GamePlugin<DiceCircusState, DiceCircusAction, typeof settings> = {
  id:"dice-circus", title:"Dice Circus", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"The circus is in town — pick low (2-6), mid (7-8), or high (9-12).",
  howToPlay:"Dice Circus rolls a colorful big-top dice mini. Each round, you bet on which range the sum of two dice will fall into: Low (2-6), Mid (7-8), or High (9-12). After your pick, the dice are rolled, and the sum is checked against your bet.\n\nScoring: Low pays 12 points (about 41% likely), Mid pays 25 points (about 28% likely — mostly the centered 7s and 8s), and High pays 12 points (also about 41% likely with sums 9-12 a touch under). Wrong calls score zero.\n\nTen rounds total. Mid is a high-payout bet but rolls less often; Low and High are safer. Pick the right range and your circus act will be the talk of the town. Step right up — the dice await!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceCircusSettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-circus-roll"]', pulses: 3 }; },
  component:DiceCircusGame,
};
