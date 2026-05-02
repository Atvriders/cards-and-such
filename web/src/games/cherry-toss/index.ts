import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CherryTossState, CherryTossAction, CherryTossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CherryTossGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cherryTossPlugin: GamePlugin<CherryTossState, CherryTossAction, typeof settings> = {
  id: "cherry-toss", title: "Cherry Toss", category: "arcade",
  players: { min:1, max:1, multiplayer:false },
  description: "Toss cherries into a bowl at the perfect angle — aim true for sweet, juicy points!",
  howToPlay: `Cherry Toss is a fruit-flinging arcade game. Each round you set a power value and toss a cherry toward a waiting bowl. Score up to 100 points per round if your power perfectly matches the target. 10 rounds of cherry fun — try to go perfect!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as CherryTossSettings),
  reducer, isTerminal,
    hint: (state: CherryTossState) => {
      if (state.phase === "done") return null;
      return { selector: '[data-testid="hint-target-cherry-toss-action"]', pulses: 3 };
    },
  component: CherryTossGame,
};
