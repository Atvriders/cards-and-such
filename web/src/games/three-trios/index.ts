import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ThreeTriosState, ThreeTriosAction, ThreeTriosSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ThreeTriosGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const threeTriosPlugin: GamePlugin<ThreeTriosState, ThreeTriosAction, typeof settings> = {
  id:"three-trios", title:"Three Trios", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Card mini: Score triples (three of a kind) for big bonuses.",
  howToPlay:"Three Trios is a 16-draw card mini built around three-of-a-kind. As you draw cards, the game watches your hand for ranks that match. The third card of any rank scores 60 points (the trio bonus); a fourth or later same rank scores 30 each (extra match bonus).\n\nThere's no skill — just draw, draw, draw, and hope for matching ranks. With 16 draws from a 52-card deck, you'll average 1-2 trios per game. Lucky runs land 3 or even 4 trios for spectacular scores.\n\nEach card flips face-up and joins your visible hand. The latest card highlights, and your trio counter ticks up whenever you complete a third of a kind. The game ends automatically after 16 draws.\n\nThree Trios rewards rank-clustering luck. Pure variance, easy to learn, and great for a quick blast of card-game serotonin.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ThreeTriosSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-three-trios-primary"]', pulses: 3 }),component:ThreeTriosGame,
};
