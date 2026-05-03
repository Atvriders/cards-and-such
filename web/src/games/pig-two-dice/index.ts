import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PigTwoDiceState, PigTwoDiceAction, PigTwoDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PigTwoDiceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pigTwoDicePlugin: GamePlugin<PigTwoDiceState, PigTwoDiceAction, typeof settings> = {
  id:"pig-two-dice", title:"Pig (Two Dice)", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Two-dice Pig: roll a 1 to bust the round; double 1s wipe entire score. 10 rounds vs CPU.",
  howToPlay:"Pig (Two Dice) is the two-dice variant of the classic Pig push-your-luck game. Each turn you \"press your luck\" by rolling two dice; rolling a single 1 busts your turn (you score 0 for the round); rolling double 1s wipes your entire game total back to zero!\n\nIn this 10-round version, each round you press the Roll button up to five times. Each non-1 roll adds the dice sum to your round total. Hold to bank your round total. A single 1 = round busted (bank 0). Double 1s = entire game total reset to 0 — a devastating swing.\n\nIn this auto-bank version, the system rolls 5 times automatically and you simply receive the result for each round. Average expected score: 60-130 points across 10 rounds. The double-1s wipe punishment is rare (1 in 36 per roll) but session-defining when it happens.\n\nFast, swingy, and pure adrenaline.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PigTwoDiceSettings),
  reducer,isTerminal,
  hint: (state: PigTwoDiceState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "roll") return { selector: '[data-testid="hint-target-pig-two-dice-roll"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-pig-two-dice-next"]', pulses: 3 };
    return null;
  },
  component:PigTwoDiceGame,
};
