import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceVortexState, DiceVortexAction, DiceVortexSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceVortexGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceVortexPlugin: GamePlugin<DiceVortexState, DiceVortexAction, typeof settings> = {
  id:"dice-vortex", title:"Dice Vortex", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pick a multiplier, then roll a die. Hit the threshold or bust. 10 rounds.",
  howToPlay:`Dice Vortex is a risk-and-reward dice mini built around multipliers. Each round you choose a multiplier — x1, x2, x3, or x4 — before rolling a single six-sided die. If the rolled value meets or exceeds your multiplier, your score for the round equals (die × multiplier). If the die rolls below the multiplier, you BUST and score 0.

So x1 is risk-free (any roll wins; max 6 points), x2 needs a 2 or higher (5/6 chance, max 12), x3 needs a 3 or higher (4/6 chance, max 18), and x4 needs a 4 or higher (3/6 chance, max 24).

The expected values are: x1 = 3.5, x2 ≈ 6.67, x3 ≈ 8.33 (the optimal pick), x4 = 8. So consistently picking x3 should yield ~83 points across 10 rounds, but variance is brutal. Risky x4 picks can stack 24-point rounds — or zero them out.

Press a multiplier to lock in and roll; press Next to continue. Choose carefully — the vortex shows no mercy.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceVortexSettings),
  reducer,
  isTerminal,
  hint: (state: DiceVortexState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "choosing") return { selector: '[data-testid="hint-target-dice-vortex-roll"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-dice-vortex-next"]', pulses: 3 };
    return null;
  },
  component:DiceVortexGame,
};
