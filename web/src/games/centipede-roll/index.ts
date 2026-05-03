import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CentipedeRollState, CentipedeRollAction, CentipedeRollSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CentipedeRollGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const centipedeRollPlugin: GamePlugin<CentipedeRollState, CentipedeRollAction, typeof settings> = {
  id:"centipede-roll", title:"Centipede Roll", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll one die up to 25 times. Aim for a running sum closest to 100.",
  howToPlay:`Centipede Roll is a simple but devious push-your-luck game. You roll a single six-sided die — up to 25 times — and your goal is to land the running sum as close as possible to exactly 100. Score = 100 minus the absolute distance from 100, floored at 0.

Twenty-five rolls average a sum of 87.5 (since each die averages 3.5), so rolling all 25 will tend to leave you about 12 short of the target — costing you 12 points. To compete for a perfect 100, you might need to stop early when fortune has favored you with high pip rolls. But stop too soon and you'll be far below; roll too long and you'll overshoot.

Two buttons: Roll to add another die, or Stop to lock in your current sum. The game ends after 25 rolls or when you stop. A score of 90+ is excellent; a perfect 100 is a 1-in-many feat. Push that luck!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CentipedeRollSettings),
  reducer,isTerminal,
  hint: (state: any) => {
    if ((state as any).phase === "done") return null;
    const sum = (state as any).sum ?? 0;
    if (sum >= 90) return { selector: '[data-testid="hint-target-centipede-roll-stop"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-centipede-roll-roll"]', pulses: 3 };
  },
  component:CentipedeRollGame,
};
