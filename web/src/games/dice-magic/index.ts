import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceMagicState, DiceMagicAction, DiceMagicSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceMagicGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceMagicPlugin: GamePlugin<DiceMagicState, DiceMagicAction, typeof settings> = {
  id:"dice-magic", title:"Dice Magic", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Magic show — predict odd or even sum, or a multiple of 3.",
  howToPlay:"Dice Magic is a sleight-of-hand dice mini. Each round you call your trick: Odd Sum (the magician's classic — 50% chance, pays 10), Even Sum (the apprentice's bet — 50% chance, pays 10), or Multiple of 3 (the master's prediction — about 33%, pays 25). The dice are rolled and the trick is evaluated.\n\nScoring: each call pays its listed value if correct, zero otherwise. Wrong calls always vanish into thin air. Ten rounds total.\n\nOdd/even are tied 50/50 by parity, while Multiple of 3 spreads across (3, 6, 9, 12) — a third of all sums. Mix in a Magic call now and again to boost the score. Pull off enough tricks and the audience will roar with applause!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceMagicSettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-magic-roll"]', pulses: 3 }; },
  component:DiceMagicGame,
};
