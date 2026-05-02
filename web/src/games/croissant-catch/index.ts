import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CroissantCatchState, CroissantCatchAction, CroissantCatchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CroissantCatchGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const croissantCatchPlugin: GamePlugin<CroissantCatchState, CroissantCatchAction, typeof settings> = {
  id:"croissant-catch", title:"Croissant Catch", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Catch hot croissants from the oven. 30-second clicker.",
  howToPlay:`Croissant Catch is a 30-second French bakery clicker. Steam-fresh croissants drift across the screen; tap each one before it slides offscreen. Each croissant caught scores 10 points.

The game ticks once per second, spawning 1-2 new croissants in random lanes. Each croissant lingers for a few ticks before vanishing into the wind. Miss too many and your score takes a hit.

There's no skill ceiling — the more croissants you catch in 30 seconds, the higher your score. Average runs cluster near 200-300; speedy bakers chase 500+. The clock counts down in the corner; when it hits zero, your croissant haul is locked in.

Ne les manquez pas — don't miss them! Tap fast for a flaky-fresh top score.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CroissantCatchSettings),
  reducer,isTerminal,
  hint: (state: CroissantCatchState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-croissant-catch-target"]', pulses: 3 };
  },
  component:CroissantCatchGame,
};
