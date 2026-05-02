import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceCookingState, DiceCookingAction, DiceCookingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceCookingGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceCookingPlugin: GamePlugin<DiceCookingState, DiceCookingAction, typeof settings> = {
  id:"dice-cooking", title:"Dice Cooking", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll dice to cook dishes — high rolls perfect the recipe!",
  howToPlay:`Dice Cooking is a quick 10-round dice game with a culinary twist. Each round you roll one six-sided die. A roll of 4 or higher (the perfect cooking temperature!) earns you 10 points; rolls of 1, 2, or 3 are undercooked and earn nothing.

Press Roll Die to cook each round. The probability of rolling 4+ on a fair die is 50% (3 of 6 faces), so the expected score is around 50 points. A perfect run scores 100; a hot streak might land you 70-80, while an unlucky session might drop you below 30.

There are no choices to make — just press Roll Die for each round and let the dice decide. After 10 rounds, the kitchen closes and you see your final culinary score. Cook up a high score!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceCookingSettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-cooking-roll"]', pulses: 3 }; },
  component:DiceCookingGame,
};
