import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardMountainState, CardMountainAction, CardMountainSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardMountainGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardMountainPlugin: GamePlugin<CardMountainState, CardMountainAction, typeof settings> = {
  id:"card-mountain", title:"Card Mountain", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Cards on a mountain — descend by rank for points across 12 rounds.",
  howToPlay:"Card Mountain is a 12-round single-deck card mini. Each round you draw 5 cards from a fresh deck. The total pip value of your hand determines how high up the mountain you started: lower sums mean a steeper descent and more points.\n\nYour score for the round equals 60 minus 2 times the sum of pip values, capped at 0 minimum. Aces count as 1 (the lightest at the top of the peak), face cards (J/Q/K) count as 11/12/13 (heaviest, near the base). Numbered cards count their face value. A perfect light hand of 5 aces would be impossible from a single deck, but a hand of low spots (2,2,3,4,5 for example) gives you a strong score.\n\nPress Deal 5 to draw your hand, see your sum and points, then Next to descend the next round. After 12 rounds your final mountain score is locked in. Average runs land near 100-180 points; expert sums under 25 per round can push you over 300.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardMountainSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-mountain-primary"]', pulses: 3 }), component:CardMountainGame,
};
