import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceShootMiniState, DiceShootMiniAction, DiceShootMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceShootMiniGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceShootMiniPlugin: GamePlugin<DiceShootMiniState, DiceShootMiniAction, typeof settings> = {
  id:"dice-shoot-mini", title:"Dice Shoot Mini", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Aim and shoot a die at the target value — exact hits score 25, near misses still score.",
  howToPlay:`Dice Shoot Mini is a 10-round target shooter using a single six-sided die. Each round shows a target value (1–6); you press SHOOT and roll a die. Match the target exactly to score a HIT.

Scoring per round:
- Exact match (HIT): 25 points
- Off by one (close): 5 points
- Off by two or more (miss): 0 points

Maximum theoretical score is 250 (10 perfect hits — exactly 1 in 6^10 odds). Realistic averages: ~83 points (every 6th roll is a hit, every other near, average around 8.3 per round).

There's no aiming skill in this version — the die rolls are random — so it's a probability bingo where the suspense lives in waiting for the d6 to settle. Each round target is also random, so the exposure is symmetric.

Press SHOOT to roll, then Next Target to continue. Try to remember which targets you nailed: it makes a fun improvised statistics game with friends.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceShootMiniSettings),
  reducer, isTerminal,
    hint: (state: DiceShootMiniState) => {
      if (state.phase === "done") return null;
      return { selector: '[data-testid="hint-target-dice-shoot-mini-action"]', pulses: 3 };
    },
  component: DiceShootMiniGame,
};
