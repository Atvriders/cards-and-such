import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RedRiverState, RedRiverAction, RedRiverSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RedRiverGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const redRiverPlugin: GamePlugin<RedRiverState, RedRiverAction, typeof settings> = {
  id:"red-river", title:"Red River", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Score by drawing consecutive red cards; resets on black. 12 draws.",
  howToPlay:`Red River rewards red streaks. You'll draw 12 cards across the run. Every red card (hearts or diamonds) extends your current streak; the points awarded equal 10 times your new streak length. Draw a black card and your streak resets to zero — but your score so far is safe.

So a single red is +10. Two reds in a row: +10 then +20 = +30 total for that pair. A streak of five reds yields 10+20+30+40+50 = +150 from those five draws. The longer the river, the bigger the bonus, so when red is flowing, every flip raises the stakes!

Average score across 12 draws is around 80–120, but a long streak can push you well above. The game ends after 12 flips. Hit Draw, then Next, and chase the longest red river you can!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RedRiverSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-red-river-primary"]', pulses: 3 }),component:RedRiverGame,
};
