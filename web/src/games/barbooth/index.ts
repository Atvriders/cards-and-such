import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BarboothState, BarboothAction, BarboothSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BarboothGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const barboothPlugin: GamePlugin<BarboothState, BarboothAction, typeof settings> = {
  id:"barbooth", title:"Barbooth", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Greek/Montreal two-dice gambling game. Specific combos win. 12 rounds.",
  howToPlay:"Barbooth (or Barbotte in French) is a two-dice gambling game popular in Greek and Montreal communities. Players bet on whether specific dice combinations will appear before others. In this 12-round single-player version, you roll two dice and score based on Barbooth's distinctive combo rules.\n\nWinning combos: 1-2 = 30, 3-5 = 25, 4-6 = 25, 6-6 = 50, 5-5 = 40, 4-4 = 30, 3-3 = 25, 2-2 = 20, 1-1 = 15. Losing combos in classic Barbooth are 3-4, 5-6, 1-2 from the opposite player's perspective; here non-listed combos score 0.\n\n12 rounds total. The probability of any given combo is small (1/18 for unique pairs, 1/36 for doubles), so most rounds will score zero, but a hit pays well. Average expected score: 80-160 points.\n\nFast, sharp, and uniquely Mediterranean. The double-six is the king of all rolls.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BarboothSettings),
  reducer,isTerminal,
  hint: (state: BarboothState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "roll") return { selector: '[data-testid="hint-target-barbooth-roll"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-barbooth-next"]', pulses: 3 };
    return null;
  },
  component:BarboothGame,
};
