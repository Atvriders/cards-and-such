import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WelcomeToDungeonState, WelcomeToDungeonAction, WelcomeToDungeonSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WelcomeToDungeonGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const welcomeToDungeonPlugin: GamePlugin<WelcomeToDungeonState, WelcomeToDungeonAction, typeof settings> = {
  id:"welcome-to-dungeon",
  title:"Welcome To Dungeon",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Push-your-luck dungeon equipment game.",
  howToPlay:"Welcome To Dungeon is a 10-round push-your-luck card game. Each round draws two Equipment cards (worth 2-6) and three Monster cards (worth 1-7). Your equipment sum versus monster sum: if equipment wins, score the difference times 2. Otherwise the hero falls and you score 0. 🚪\n\nThe expected equipment total is around 8; monsters around 12 — the hero is at a disadvantage. Maybe 30-40% of rounds you'll score; expect totals in the 25 to 50 range across 10 rounds.\n\nPress Draw to reveal the round's combat, then Next to send the next hero in. Equipment glows blue; monsters glow red. Score 40+ to be a smart dungeon master. The brutal odds make each victory exciting. Quick, dramatic combat in tight little rounds — finishes in well under a minute. A great fantasy push-your-luck taste.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as WelcomeToDungeonSettings),
  reducer,
  isTerminal,
  component:WelcomeToDungeonGame,
};
