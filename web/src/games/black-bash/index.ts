import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BlackBashState, BlackBashAction, BlackBashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BlackBashGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const blackBashPlugin: GamePlugin<BlackBashState, BlackBashAction, typeof settings> = {
  id:"black-bash", title:"Black Bash", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Score on every black card. 15 draws; +10 per black.",
  howToPlay:"Black Bash is the mirror image of Red Rally: every black card (spades and clubs) scores 10 points, while red cards (hearts and diamonds) score zero. Each draw is a 50/50 shot in a balanced deck of 26 black and 26 red cards.\n\nYou play 15 rounds. Expect an average score around 75 (7-8 blacks per game), with hot streaks soaring past 110 and cold streaks slumping below 50. The theoretical max is 150 points — fifteen blacks in a row, an extreme lucky run.\n\nThe mechanic is simple and meditative: press Draw, see the card, press Next. There's no choice, no strategy, just the back-and-forth dance of red and black. A perfect quick-play card mini for when you want a 90-second flutter without any decision-making weight on your shoulders.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BlackBashSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-black-bash-primary"]', pulses: 3 }), component:BlackBashGame,
};
