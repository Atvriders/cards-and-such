import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TwoTwosomeState, TwoTwosomeAction, TwoTwosomeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TwoTwosomeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const twoTwosomePlugin: GamePlugin<TwoTwosomeState, TwoTwosomeAction, typeof settings> = {
  id:"two-twosome", title:"Two Twosome", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Card mini: Find the twos! Each 2 drawn earns 15 points.",
  howToPlay:"Two Twosome is a 14-draw card mini focused on the rank 2. Each draw flips one card from a 52-card deck, and every 2 revealed scores 15 points.\n\nA standard deck has four twos, so the theoretical maximum is 60 points; realistic scores fall in the 0-45 range. The game is pure draw-and-reveal — no skill, no choices, just luck. The whole run lasts about a minute.\n\nPast cards form a small ribbon below the current reveal so you can review the deck history visually. Twos light up as scoring cards; everything else passes through silently. The game ends automatically after 14 draws.\n\nTwo Twosome is a tiny luck game perfect for breaks between bigger sessions. Don't overthink it — just press Draw and let the deck deliver. Catch all four twos and you're a champion!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TwoTwosomeSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-two-twosome-primary"]', pulses: 3 }),component:TwoTwosomeGame,
};
