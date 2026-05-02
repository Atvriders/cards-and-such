import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NougatNetState, NougatNetAction, NougatNetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NougatNetGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const nougatNetPlugin: GamePlugin<NougatNetState, NougatNetAction, typeof settings> = {
  id:"nougat-net", title:"Nougat Net", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Catch falling nougat blocks before they hit the floor \u2014 30-second clicker.",
  howToPlay:"Nougat Net is a chewy 30-second clicker arcade. Blocks of soft nougat drift down from above in six lanes of a candy factory floor; tap each block to net it for 10 points. Each nougat block stays on screen for only a few ticks before sliding away, so quick reflexes matter.\n\nThe game ticks roughly once per second, spawning fresh nougat in random lanes. The candy line is fast \u2014 the board can fill quickly with chewy targets \u2014 so keep tapping with steady rhythm. Every nougat you catch is 10 points closer to a top score.\n\nNo strategy required, just hand-eye coordination. The more nougat blocks you net in 30 seconds, the higher your score. Average runs land near 200-300 points; expert clickers can push 500+ on a hot streak. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nNet that nougat!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NougatNetSettings),
  reducer,isTerminal,
  hint: (state: NougatNetState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-nougat-net-target"]', pulses: 3 };
  },
  component:NougatNetGame,
};
