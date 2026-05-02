import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceMuseumState, DiceMuseumAction, DiceMuseumSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceMuseumGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceMuseumPlugin: GamePlugin<DiceMuseumState, DiceMuseumAction, typeof settings> = {
  id:"dice-museum", title:"Dice Museum", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Collect dice exhibits — high pips score across 10 rounds.",
  howToPlay:"Dice Museum is a 10-round exhibit-collecting game. Each round you roll five dice, and high-value dice are the rare exhibits worth display space in your museum hall.\n\nYour round score equals 4 points for each die showing 5 or 6, plus 2 points for each die showing 3 or 4, plus 0 for 1 or 2. So a roll of 6-6-5-3-1 scores 4+4+4+2+0 = 14 points. The maximum single round is 5*4 = 20 points (all 5s and 6s); minimum is 0 (all 1s and 2s).\n\nPress Roll 5 Dice each round to discover your exhibits, then Next to curate the next gallery. After 10 rounds your museum is fully stocked. Expected average is roughly 10 points per round (since average die scores 2 points), so typical runs land near 90-110 points. Strong runs of high-pip dice can push you over 150. Curate well, and welcome to the Dice Museum!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceMuseumSettings),
  reducer,
  isTerminal,
  hint: (state: DiceMuseumState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "roll") return { selector: '[data-testid="hint-target-dice-museum-roll"]', pulses: 3 };
    return null;
  },
  component:DiceMuseumGame,
};
