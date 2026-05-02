import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceCaveState, DiceCaveAction, DiceCaveSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceCaveGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceCavePlugin: GamePlugin<DiceCaveState, DiceCaveAction, typeof settings> = {
  id:"dice-cave", title:"Dice Cave", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Cave exploration with dice — 12 rounds.",
  howToPlay:"Dice Cave is a quick dice game with simple, satisfying scoring. Each round, two six-sided dice are rolled, and points are awarded based on the result.\n\nScore is the larger die x 5; rolling at least one 6 adds a 20-point cave-bonus. 12 rounds.\n\nPress Roll to play the round, then press Next to advance. There are no choices — every game is pure variance, but watching the score climb makes it irresistible. Try to chase a personal best by replaying with different seeds.\n\nTotal score depends on how often the dice cooperate. Some rounds will pay zero, others will pay big. With multiple rounds you'll usually average something in the middle of the range — but a hot streak can push your run far higher. Roll, watch, repeat!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceCaveSettings),
  reducer,
  isTerminal,
  hint: (state: DiceCaveState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "roll") return { selector: '[data-testid="hint-target-dice-cave-roll"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-dice-cave-next"]', pulses: 3 };
    return null;
  },
  component:DiceCaveGame,
};
