import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FridayIslandSurvivalState, FridayIslandSurvivalAction, FridayIslandSurvivalSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FridayIslandSurvivalGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const fridayIslandSurvivalPlugin: GamePlugin<FridayIslandSurvivalState, FridayIslandSurvivalAction, typeof settings> = {
  id:"friday-island-survival",
  title:"Friday Island Survival",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Survive each round — fight off hazards.",
  howToPlay:"Friday Island Survival is a solo card game where you face a hazard each round. Each round draws one Hazard card valued 4-9, and one Skill card valued 3-12. If your Skill is greater than or equal to the Hazard, you survive and score the difference. If less, you take damage equal to the gap (subtracted from your score, never below zero). 🏝️\n\nNo choices, just draw-and-resolve over 10 island days. The expected gap of skill over hazard hovers around 1, so you'll see a mix of close victories and brutal losses.\n\nPress Draw to flip both cards and resolve. Then Next to face the next day. Watch your survival score in green; damage flashes red. Score 25+ to escape the island as a Robinson Crusoe legend, or under 10 to barely scrape by. Quick, tense, fantasy survival in card form.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FridayIslandSurvivalSettings),
  reducer,
  isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-friday-island-survival-primary"]', pulses: 3 }),
  component:FridayIslandSurvivalGame,
};
