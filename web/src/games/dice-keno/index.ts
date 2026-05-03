import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceKenoState, DiceKenoAction, DiceKenoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceKenoGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceKenoGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceKenoPlugin: GamePlugin<DiceKenoState, DiceKenoAction, typeof settings> = {
  id:"dice-keno", title:"Dice Keno", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pick a multiset of five faces (1-6); five dice are rolled and matches pay points.",
  howToPlay:`Dice Keno is a five-pick keno-style mini using dice instead of numbered balls. Each round, pick five face values from 1 through 6 — you can repeat the same face up to all five times, so a 5-of-a-kind '6,6,6,6,6' bet is allowed. Use the '+' button to add a face to your picks and '-' to remove. Once you have exactly five picks, hit Roll Dice.

Five dice are rolled. Your score is the multiset intersection between your picks and the rolled dice — that is, how many of your picks match a die. Each match earns 6 points. If all five of your picks match (a Five-of-a-Kind jackpot), you also earn a bonus 20 points, for a maximum 50 per round.

There are 8 rounds. Spreading picks across faces is the safer base strategy; concentrating on one number is high-variance with a tiny chance of jackpot. Average expected scores hover near 50; chase a bonus or two and 100+ is in reach.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceKenoSettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-keno-roll"]', pulses: 3 }; },
  component:DiceKenoGame,
};
