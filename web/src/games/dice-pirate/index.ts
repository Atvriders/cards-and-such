import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DicePirateState, DicePirateAction, DicePirateSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DicePirateGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dicePiratePlugin: GamePlugin<DicePirateState, DicePirateAction, typeof settings> = {
  id:"dice-pirate", title:"Dice Pirate", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pirate dice: sum exactly 7 lands treasure. 10 rounds.",
  howToPlay:"Dice Pirate is a 10-round pirate-themed dice mini. Each round, you roll two dice and try to find treasure on the high seas. A sum of exactly 7 (the most common outcome with two dice) means you've struck treasure and score 10 points. Any other sum yields no treasure that round.\n\nThe probability of sum 7 is 6/36, exactly 1/6 (16.7%). Across 10 rounds, expected scores are around 17 points; a hot streak of 7s can push you to 30-40 points.\n\nThe pirate theme is purely cosmetic — Captain Blackbeard and his crew make no actual appearance. Mechanically, this is a target-sum dice game with a tight winning condition. Most rounds will be misses, so the rare 7s feel especially exciting when they hit. Press Roll, watch the dice, and see if today's the day you find the buried treasure!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DicePirateSettings),
  reducer,
  isTerminal,
  hint: (state: DicePirateState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "fire") return { selector: '[data-testid="hint-target-dice-pirate-roll"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-dice-pirate-next"]', pulses: 3 };
    return null;
  },
  component:DicePirateGame,
};
