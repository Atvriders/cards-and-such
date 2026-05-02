import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceFisheryState, DiceFisheryAction, DiceFisherySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceFisheryGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceFisheryPlugin: GamePlugin<DiceFisheryState, DiceFisheryAction, typeof settings> = {
  id:"dice-fishery", title:"Dice Fishery", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Cast nets with five dice. Fives are prized fish; 10 rounds.",
  howToPlay:"Dice Fishery is a 10-round dice mini themed around a small coastal fishing operation. Each round, you cast a net of five dice representing the haul. Each die is a fish — fives are prized salmon and score 12 points each. Anything else is small fry and scores nothing.\\n\\nPress Cast to roll the five dice and see what's in the net, then press Next to motor to the next fishing spot. There's no choice or skill — the sea provides what it pleases.\\n\\nWith 1/6 chance per die, you'll catch about 0.83 prized fish per cast on average — roughly 10 points per round, or 100 points over the full 10 rounds. Lucky days can push 140+ if a couple of casts net 2-3 salmon at once; unlucky ones can leave you near 50. Cast wide and hope the salmon are running!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceFisherySettings),
  reducer,
  isTerminal,
  hint: (state: DiceFisheryState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "roll") return { selector: '[data-testid="hint-target-dice-fishery-roll"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-dice-fishery-next"]', pulses: 3 };
    return null;
  },
  component:DiceFisheryGame,
};
