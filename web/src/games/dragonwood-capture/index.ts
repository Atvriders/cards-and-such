import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DragonwoodCaptureState, DragonwoodCaptureAction, DragonwoodCaptureSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DragonwoodCaptureGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dragonwoodCapturePlugin: GamePlugin<DragonwoodCaptureState, DragonwoodCaptureAction, typeof settings> = {
  id:"dragonwood-capture",
  title:"Dragonwood Capture",
  category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll dice to capture forest creatures.",
  howToPlay:"Dragonwood Capture is a 10-round monster-capture dice game inspired by the family card-and-dice game. Each round, you roll three six-sided dice and the wild creature reveals a target value (5-15). Sum your three dice — if you meet or exceed the creature's value, you capture it and score the creature's value. Otherwise score 0. 🌲\n\nCreature values vary: 5 is an easy capture, 15 is a dragon. The expected dice sum is around 10.5. Easier creatures fall almost always; tougher ones rarely. Across 10 rounds, expect totals near 60 to 100.\n\nPress Roll to attempt the capture, then Next to face the next creature. Each die displays clearly; the creature's required value is shown above. Score 80+ to be the master of Dragonwood. The game completes in well under a minute, capturing the original game's roll-and-conquer vibe in a brisk fantasy ride.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DragonwoodCaptureSettings),
  reducer,
  isTerminal,
    hint: (state: DragonwoodCaptureState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dragonwood-capture-roll"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-dragonwood-capture-next"]', pulses: 3 };
    return null;
  },
  component:DragonwoodCaptureGame,
};
