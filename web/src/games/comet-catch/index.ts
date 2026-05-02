import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CometCatchState, CometCatchAction, CometCatchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CometCatchGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cometCatchPlugin: GamePlugin<CometCatchState, CometCatchAction, typeof settings> = {
  id:"comet-catch", title:"Comet Catch", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Catch comets streaking across the cosmos. 30-second arcade clicker.",
  howToPlay:"Comet Catch is a 30-second galactic clicker. Comets streak across the dark sky in six lanes; tap each fiery comet before it disappears beyond the screen edge for 10 points apiece.\n\nEach comet only stays visible for a few ticks — you've got to be fast. The board ticks roughly once per second, spawning new comets at random positions. Mash the screen and rack up cosmic points before the timer expires.\n\nMost players hit 200-300 points on a focused run. Top scorers blow past 500 with sharp reflexes and quick aim. The clock in the top right counts down; when it hits zero, your final catch tally is locked. There's no penalty for misses — just keep clicking comets as fast as they appear. Aim for the sky and chase those comets across the cosmos!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CometCatchSettings),
  reducer,isTerminal,
  hint: (state: CometCatchState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-comet-catch-target"]', pulses: 3 };
  },
  component:CometCatchGame,
};
