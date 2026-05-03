import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CthulhuDiceState, CthulhuDiceAction, CthulhuDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CthulhuDiceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cthulhuDicePlugin: GamePlugin<CthulhuDiceState, CthulhuDiceAction, typeof settings> = {
  id:"cthulhu-dice", title:"Cthulhu Dice", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Madness-themed dice. Roll 3 dice/round; faces convey points or score-stealing. 10 rounds vs CPU.",
  howToPlay:"Cthulhu Dice is a tiny press-your-luck game with eldritch theme. In this 10-round version, both you and the CPU roll three dice per round; each face is symbolic of a Cthulhu mythos action: 1=Yellow Sign (gain), 2=Tentacle (gain double), 3=Elder Sign (steal CPU pts), 4=Cthulhu (CPU loses 30 to madness), 5=Eye (CPU steals from you), 6=Insanity (you lose 10 to madness).\n\nThe system rolls your three dice and tallies each face's effect: Tentacles add 20 each, Yellow Signs add 10 each, Elder Signs steal 15 from CPU each, Cthulhus give you 30 (CPU madness), Eyes lose 15 to CPU each, Insanity subtracts 10 each.\n\n10 rounds total. CPU score doesn't directly limit you (it's tracked but not used here in adversarial scoring); the steal effects redirect points abstractly. Average expected score: 50-150 points.\n\nThematic and chaotic. Roll dice, lose sanity, gain points.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CthulhuDiceSettings),
  reducer,isTerminal,
  hint: (state: CthulhuDiceState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "roll") return { selector: '[data-testid="hint-target-cthulhu-dice-roll"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-cthulhu-dice-next"]', pulses: 3 };
    return null;
  },
  component:CthulhuDiceGame,
};
