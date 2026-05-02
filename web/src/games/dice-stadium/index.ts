import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceStadiumState, DiceStadiumAction, DiceStadiumSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceStadiumGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceStadiumPlugin: GamePlugin<DiceStadiumState, DiceStadiumAction, typeof settings> = {
  id:"dice-stadium", title:"Dice Stadium", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pick a cheer level before rolling 3 dice. Cheer level multiplies your score if you hit the threshold.",
  howToPlay:`Dice Stadium is a 12-round risk-and-reward dice game with stadium energy. Each round, before three dice are rolled, you pick a cheer level: Low, Mid, or Roar. The cheer determines how the dice sum is scored:

• Low: you score the dice sum directly. Always safe; max 18, expected ~10.5.
• Mid: if the sum is at least 10, you score the sum × 1.5 (rounded down). Otherwise zero.
• Roar: if the sum is at least 14, you score the sum × 2. Otherwise zero.

The probability of a 3-die sum being 10+ is about 50%, and 14+ is around 16%. So Roar is genuinely risky — but the rewards are big: a perfect 18 with a Roar bet yields 36 points. Across 12 rounds, max theoretical score is 432 (rolling 18 every time with Roar selected); realistic averages cluster around 130-180.

Cheer wisely: too cautious and you leave points on the table; too bold and the crowd goes silent. Pick your level, watch the dice roll, and feel the stadium roar!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceStadiumSettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-stadium-roll"]', pulses: 3 }; },
  component:DiceStadiumGame,
};
