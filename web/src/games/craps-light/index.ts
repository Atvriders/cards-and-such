import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CrapsLightState, CrapsLightAction, CrapsLightSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CrapsLightGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const crapsLightPlugin: GamePlugin<CrapsLightState, CrapsLightAction, typeof settings> = {
  id:"craps-light", title:"Craps Light", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pass or don't pass on the come-out roll. 10 rounds.",
  howToPlay:`Craps Light is a streamlined come-out-only craps game. Each of 10 rounds, you pick Pass Line or Don't Pass, then two dice are rolled.

Pass Line wins (+10 points) on a 7 or 11; loses on a 2, 3, or 12; otherwise pushes (0 points). Don't Pass wins (+10) on a 2 or 3; loses on a 7 or 11; pushes on a 12 or any other number. There's no point-establishment chasing — just one roll, one outcome.

Pass Line wins about 22.2% of the time and loses about 11.1%; Don't Pass wins about 8.3% and loses about 22.2%. So Pass is statistically the smarter pick on each roll, but variance is high. Average expected score across 10 rounds with Pass: ~22 points. Pick boldly, watch the bones tumble, and chase those crap-shooter wins!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CrapsLightSettings),
  reducer,isTerminal,component:CrapsLightGame,
  hint: (state: CrapsLightState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "betting") return { selector: '[data-testid="hint-target-crapslight-bet"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-crapslight-next"]', pulses: 3 };
    return null;
  },
};
