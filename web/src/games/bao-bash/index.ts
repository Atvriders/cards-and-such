import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BaoBashState, BaoBashAction, BaoBashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BaoBashGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const baoBashPlugin: GamePlugin<BaoBashState, BaoBashAction, typeof settings> = {
  id:"bao-bash", title:"Bao Bash", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click pillowy steamed buns straight off the bamboo steamer. 30-second clicker arcade.",
  howToPlay:"Bao Bash is a 30-second clicker celebrating Cantonese steamed buns — the pillowy white char siu bao filled with BBQ pork, the custardy lai wong bao, and every soft fluffy variation in between. Buns rise up across the steamer; tap each one to grab it before it goes back into the basket. Every grabbed bao scores 10 points.\n\nThe game ticks roughly once per second, spawning fresh bao in random lanes. The screen can fill with steamy buns quickly, so tap fast and aim true — every bao you grab is 10 points closer to dim sum legend status.\n\nThere's no skill ceiling: the more buns you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real bao bash talent. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nFluffy, white, hot — grab them while you can!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BaoBashSettings),
  reducer,isTerminal,
  hint: (state: BaoBashState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-bao-bash-target"]', pulses: 3 };
  },
  component:BaoBashGame,
};
