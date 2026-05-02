import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DicePhotographyState, DicePhotographyAction, DicePhotographySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DicePhotographyGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dicePhotographyPlugin: GamePlugin<DicePhotographyState, DicePhotographyAction, typeof settings> = {
  id:"dice-photography", title:"Dice Photography", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll dice to set the angle — low rolls capture the perfect shot!",
  howToPlay:`Dice Photography is a 10-round dice game with a photography theme. Each round, you roll one six-sided die. Rolls of 1, 2, or 3 (the close-up, intimate angles) score 10 points each. Rolls of 4, 5, or 6 (too far away or distorted) score zero.

Press Roll Die to capture each photograph. The probability of rolling 3 or lower is 50% (3 of 6 faces), so the expected score is around 50 points. A perfect run scores 100; a sharp eye can hit 70-80, while an unlucky session might drop below 30.

There are no decisions or strategy — just roll and let the dice frame your shot. After 10 rounds, the photo session ends and your portfolio is locked in. The minimalist scoring belies the satisfaction of a streak of good shots. Snap to it!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DicePhotographySettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-photography-roll"]', pulses: 3 }; },
  component:DicePhotographyGame,
};
