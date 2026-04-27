import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FiveFingersState, FiveFingersAction, FiveFingersSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FiveFingersGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const fiveFingersPlugin: GamePlugin<FiveFingersState, FiveFingersAction, typeof settings> = {
  id:"five-fingers", title:"Five Fingers", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Card mini: Find the fives! Each 5 drawn earns 30 points.",
  howToPlay:"Five Fingers is a 14-draw card mini centered on the rank 5. Each draw flips a random card from a 52-card deck, and every 5 revealed scores 30 points.\n\nA standard deck has four fives, so the theoretical max is 120 points; expected scores are 0-90 depending on luck. The format is pure draw-and-reveal — no choices, just press Draw and watch the deck do its thing. The whole game lasts under a minute.\n\nPast cards stack as a thin ribbon below the latest reveal so you can replay the run visually. Fives drive your score; everything else is decorative. The game ends automatically after 14 draws.\n\nFive Fingers is a classic luck mini: nothing more, nothing less. If lady luck is on your side, you'll catch all four fives. If not, well, that's poker. Press Draw and chase those fives!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FiveFingersSettings),
  reducer,isTerminal,component:FiveFingersGame,
};
