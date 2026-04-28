import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceKubbState, DiceKubbAction, DiceKubbSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceKubbGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceKubbPlugin: GamePlugin<DiceKubbState, DiceKubbAction, typeof settings> = {
  id:"dice-kubb", title:"Dice Kubb", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Swedish lawn knockdown; 8 rounds.",
  howToPlay:"Dice Kubb simulates the Swedish yard sport — sometimes called 'Viking chess' — where teams throw wooden batons to knock over the opposing kubbs (small wooden blocks) before attempting to topple the king in the centre.\n\nEach of 8 rounds you Roll four dice (your four batons). Each die value of 4 or 5 knocks over a kubb (1 point). A roll containing all four dice between 4 and 5 (a clean round) earns +3. A roll with at least one 6 (a 'wild throw') earns -1.\n\nTypical rounds score 1-2 points; cold rounds drop to zero or negative; hot rounds score 5+. Eight rounds totalling 12-20 is a strong game; the absolute max with clean-rounds every time is 56.\n\nReal kubb is played in parks across Sweden and increasingly in North American festivals, with a small but passionate world championship community on Gotland. This mini compresses the throwing-and-counting rhythm into a fast yard-game cadence. Press Roll, Next. Distinctively Nordic and wonderfully outdoorsy.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceKubbSettings),
  reducer,isTerminal,component:DiceKubbGame,
};
