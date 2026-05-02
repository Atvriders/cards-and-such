import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RedRallyState, RedRallyAction, RedRallySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RedRallyGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const redRallyPlugin: GamePlugin<RedRallyState, RedRallyAction, typeof settings> = {
  id:"red-rally", title:"Red Rally", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Score on every red card. 15 draws; +10 per red.",
  howToPlay:"Red Rally is a coin-flip-style card mini where every red card (hearts and diamonds) scores 10 points and every black card (spades and clubs) scores nothing. With a balanced 26 red / 26 black split in a fresh deck, each draw is roughly a 50/50 shot.\n\nYou play 15 rounds. Expect an average score of around 75 points (7-8 reds), with hot streaks pushing past 110 and cold ones dipping below 50. The maximum possible is 150, but that's an extremely lucky run.\n\nThe interface is dead simple: press Draw, see the card, press Next. Each card is independently random; there's no skill, no strategy, no choice — just the rhythm of red and black, hot streaks and cold streaks, and the small joy of a satisfying string of hearts and diamonds.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RedRallySettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-red-rally-primary"]', pulses: 3 }),component:RedRallyGame,
};
