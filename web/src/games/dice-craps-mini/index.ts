import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceCrapsMiniState, DiceCrapsMiniAction, DiceCrapsMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceCrapsMiniGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceCrapsMiniPlugin: GamePlugin<DiceCrapsMiniState, DiceCrapsMiniAction, typeof settings> = {
  id:"dice-craps-mini", title:"Dice Craps Mini", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pass-line vs Don't-Pass craps shooter sim. Twelve rounds, +10 per correct call.",
  howToPlay:`Dice Craps Mini is a stripped-down craps simulation. Each round you choose a Pass-line bet or a Don't-Pass-line bet before the shooter rolls. Then the entire come-out plus point sequence resolves automatically.

Standard craps rules apply. On the come-out roll: a 7 or 11 wins for Pass; a 2 or 3 wins for Don't Pass; a 12 is a Push for Don't Pass (no points won or lost) and a Pass loss; any other number (4, 5, 6, 8, 9, 10) becomes the Point. After a Point is established, the shooter keeps rolling until either the Point repeats (Pass wins) or a 7 appears (Don't Pass wins).

Win the round to score 10 points; lose or push to score 0. There are 12 rounds, so a maximum total is 120.

Statistically Pass wins about 49.3% of the time and Don't Pass wins about 47.9%, with the small remainder going to the rare push on 12. Either bet is roughly a coin flip — it's pure dice fortune.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceCrapsMiniSettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-craps-mini-roll"]', pulses: 3 }; },
  component:DiceCrapsMiniGame,
};
