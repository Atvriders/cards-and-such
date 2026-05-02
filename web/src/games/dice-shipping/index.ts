import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceShippingState, DiceShippingAction, DiceShippingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceShippingGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceShippingPlugin: GamePlugin<DiceShippingState, DiceShippingAction, typeof settings> = {
  id:"dice-shipping", title:"Dice Shipping", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Three ships of 3 dice. Pick the highest sum each round. 6 rounds.",
  howToPlay:`Dice Shipping is a simple "best-of-three" dice puzzle. Each round, three "ships" appear, each loaded with three randomly-rolled six-sided dice (so 9 dice total per round, partitioned into three groups). Your job is to pick the ship whose dice sum is highest — the chosen ship's sum becomes your round score.

For example, if Ship 1 shows (4, 5, 6) sum 15, Ship 2 shows (1, 2, 3) sum 6, and Ship 3 shows (3, 4, 4) sum 11, the obvious play is Ship 1 for 15 points.

There are 6 rounds total, with fresh dice each round. The maximum theoretical score is 18 per round (three sixes) for a total of 108. Average scores cluster around 70-80; consistent strong picks land 90+. The strategy is trivial — always grab the highest sum — but watch for ties (if two ships tie, either is equivalent).

Press a ship to lock in your pick; press Next to advance.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceShippingSettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-shipping-roll"]', pulses: 3 }; },
  component:DiceShippingGame,
};
