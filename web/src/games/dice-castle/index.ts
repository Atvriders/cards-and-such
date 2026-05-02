import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceCastleState, DiceCastleAction, DiceCastleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceCastleGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceCastlePlugin: GamePlugin<DiceCastleState, DiceCastleAction, typeof settings> = {
  id:"dice-castle", title:"Dice Castle", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Build a dice castle wall by wall. High rolls earn extra. 8 rounds.",
  howToPlay:"Dice Castle is about building a fortress brick by brick. Each round, you roll two six-sided dice. Your score for the round is twice the sum of the dice, plus an 8-point bonus for matching pairs, plus a 6-point bonus if both dice show 5 or higher.\n\nSo an unlucky roll of (1, 1) scores 2×2 + 8 = 12. A (5, 5) scores 2×10 + 8 + 6 = 34. The maximum is (6, 6) = 38. The average roll without bonuses scores 14. Pairs occur 1/6 of the time, and both-high-dice (≥5) occur 4/36 = 11% of the time, so you'll see bonuses fairly often.\n\nYou play 8 rounds. Expected total: around 130-160. Top players (or lucky rollers) can clear 200+. Maximum theoretical: 304 (all pairs of 6s).\n\nPure dice luck — but each round, you'll feel the satisfying click of another stone in the wall.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceCastleSettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-castle-roll"]', pulses: 3 }; },
  component:DiceCastleGame,
};
