import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OddOddsState, OddOddsAction, OddOddsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OddOddsGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const oddOddsPlugin: GamePlugin<OddOddsState, OddOddsAction, typeof settings> = {
  id:"odd-odds", title:"Odd Odds", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Draw two cards each round; both odd ranks scores 20 points. 12 draws total.",
  howToPlay:`Odd Odds is a quick chance-based card game and the mirror image of Even Evens. Each draw, two cards are revealed from a shuffled deck. If both cards are odd ranks (3, 5, 7, 9, Jack, or King), you score 20 points for that draw. Mixed or even-only pairs score nothing.

You'll do 12 draws per game. There's no choice each round — just press Draw and let the cards fall. The expected average score is around 50 points based on probability, so anything above that means luck was on your side. Hit 100 or more and you've had a great run.

After each draw, press Next to continue. The game ends after the 12th draw and your final tally is your score. It's a friendly little game for a coffee break — no strategy, just a bit of card-flipping fun.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OddOddsSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-odd-odds-primary"]', pulses: 3 }),component:OddOddsGame,
};
