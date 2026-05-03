import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SkunkDiceState, SkunkDiceAction, SkunkDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SkunkDiceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const skunkDicePlugin: GamePlugin<SkunkDiceState, SkunkDiceAction, typeof settings> = {
  id:"skunk-dice", title:"Skunk Dice", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Classroom Pig variant with five columns S-K-U-N-K. 5 columns × 6 rounds = 30 dice rolls.",
  howToPlay:"Skunk is the classroom-friendly Pig variant played with five columns labeled S, K, U, N, K. You \"press your luck\" with two dice per column for several rolls, banking your accumulated total when you choose to stop. Rolling a single 1 wipes the current column; rolling double 1s wipes your entire score.\n\nIn this auto-banked version, you progress through 30 rolls (5 columns × 6 rolls each). Each two-dice roll: if both dice are 1, the entire game total resets to 0 (Skunk!). If either single die is 1, the current column wipes (worth current column total only, capped). Otherwise you add the dice sum to your column total.\n\nAverage expected score: 100-180 points. The double-1 wipe is the iconic Skunk drama — about 28% chance per session of being skunked at least once across 30 rolls. Survive to the end with a clean run and watch your score climb.\n\nFast, dramatic, classic.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SkunkDiceSettings),
  reducer,isTerminal,
  hint: (state: SkunkDiceState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "roll") return { selector: '[data-testid="hint-target-skunk-dice-roll"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-skunk-dice-next"]', pulses: 3 };
    return null;
  },
  component:SkunkDiceGame,
};
