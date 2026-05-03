import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceGalaxyState, DiceGalaxyAction, DiceGalaxySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceGalaxyGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceGalaxyGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceGalaxyPlugin: GamePlugin<DiceGalaxyState, DiceGalaxyAction, typeof settings> = {
  id:"dice-galaxy", title:"Dice Galaxy", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Galaxy multipliers favor extreme rolls. 10 rounds.",
  howToPlay:"Dice Galaxy charts the cosmos through your dice. Each round, two six-sided dice are rolled, and the sum lands in one of several galactic zones, each with its own multiplier reward.\n\nEdge zones (sum 2 or 12) are rare and pay the most: 30 points each. They occur only 1/36 of the time each (5.5% combined for hitting either). Outer zones (sums 3, 4, 5, 9, 10, 11) pay 15 points each. The transition zones (sums 6 or 8) pay 8. The middle zone, sum 7 — the most common — pays just 5 (the bull's-eye is busy and crowded).\n\nThis zone structure rewards \"extreme\" rolls and penalizes the average. You play 10 rounds. Expected per-round score: around 12-13. Total expected: 120-130. With luck on edges, you can push 180+.\n\nIt's a fun inversion of the bell curve — extremes pay big, the middle pays small.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceGalaxySettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-galaxy-roll"]', pulses: 3 }; },
  component:DiceGalaxyGame,
};
