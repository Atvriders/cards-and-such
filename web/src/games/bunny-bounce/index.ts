import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BunnyBounceState, BunnyBounceAction, BunnyBounceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BunnyBounceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const bunnyBouncePlugin: GamePlugin<BunnyBounceState, BunnyBounceAction, typeof settings> = {
  id:"bunny-bounce", title:"Bunny Bounce", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click hopping bunnies before they bounce away. 30-second clicker.",
  howToPlay:"Bunny Bounce is a 30-second tap arcade. Bunnies hop onto the screen in six lanes — your job is to gently click each one before it bounds off the board.\n\nEvery bunny tapped is worth 10 points; bunnies that escape don't subtract from your score, just from your bragging rights. The board ticks about once per second, with 1-2 fresh bunnies spawning in random lanes each beat.\n\nThere's no skill ceiling: the more bunnies you tag in 30 seconds, the higher your score. Average runs land near 200-300 points; quick-thumbed players pushing 500+ are showing real reflex talent. Don't worry — no bunnies are harmed, just gently shooed off the lawn.\n\nThe clock counts down in the top right; when it hits zero, your final tally locks in. Hop to it — there are bunnies to catch!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BunnyBounceSettings),
  reducer,isTerminal,
  hint: (state: BunnyBounceState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.critters || state.critters.length === 0) return null;
    return { selector: '[data-testid="hint-target-bunny-bounce-target"]', pulses: 3 };
  },
  component:BunnyBounceGame,
};
