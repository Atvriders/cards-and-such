import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AntAttackState, AntAttackAction, AntAttackSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AntAttackGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const antAttackPlugin: GamePlugin<AntAttackState, AntAttackAction, typeof settings> = {
  id:"ant-attack", title:"Ant Attack", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Squash marching ants before they escape. 30-second clicker.",
  howToPlay:"Ant Attack is a 30-second tap arcade. Ants march onto the screen in six lanes — your job is to squash each one with a fast click before it scurries off the board.\n\nEvery ant tapped is worth 10 points; missed ants escape but don't subtract from your score. The board ticks about once per second, with 1-2 new ants spawning each beat across random lanes.\n\nThere's no skill ceiling: the more ants you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharp-eyed players pushing 500+ are showing real reflex chops. The ants don't bite back, but they don't wait around either — keep your tap-finger primed.\n\nThe clock counts down in the top right; when it hits zero, your final tally locks in. Defend your picnic — squash, squash, squash!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AntAttackSettings),
  reducer,isTerminal,
  hint: (state: AntAttackState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.critters || state.critters.length === 0) return null;
    return { selector: '[data-testid="hint-target-ant-attack-target"]', pulses: 3 };
  },
  component:AntAttackGame,
};
