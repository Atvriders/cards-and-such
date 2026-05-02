import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CocoaCascadeState, CocoaCascadeAction, CocoaCascadeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CocoaCascadeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cocoaCascadePlugin: GamePlugin<CocoaCascadeState, CocoaCascadeAction, typeof settings> = {
  id:"cocoa-cascade", title:"Cocoa Cascade", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Catch falling cocoa beans before they vanish. 30s clicker.",
  howToPlay:"Cocoa Cascade is a 30-second cocoa-bean catcher. Beans tumble across six lanes; click each one before it falls out of view. Every bean caught is 10 points; missed beans add to your missed count and yield nothing.\n\nSpawns happen each tick (roughly once per second), one or two beans at a time. The longer you let a bean linger, the closer it comes to vanishing — so move fast! There is no level progression and no decision making; this is pure reaction-time arcade.\n\nA typical run lands at 200–300 points. Strong players push 400+; truly fast hands can reach 500. The timer reads down from 30 in the top right; when it hits zero your score is locked. Sip your cocoa, click the beans, and chase a top score!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CocoaCascadeSettings),
  reducer,isTerminal,
  hint: (state: CocoaCascadeState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-cocoa-cascade-target"]', pulses: 3 };
  },
  component:CocoaCascadeGame,
};
