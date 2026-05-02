import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SuitShuffleState, SuitShuffleAction, SuitShuffleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SuitShuffleGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const suitShufflePlugin: GamePlugin<SuitShuffleState, SuitShuffleAction, typeof settings> = {
  id:"suit-shuffle", title:"Suit Shuffle", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Deal 4 cards. Bonuses for matching suits — three of a suit, two pair, or four-of-a-kind.",
  howToPlay:`Suit Shuffle is a 10-round card game that rewards suit-matching. Each round, four random cards are dealt face-up. The score for the round depends on how many cards share a suit:

- Four of a suit (all four spades, hearts, diamonds, or clubs): a glorious +100 points.
- Three of a suit: +50 points.
- Two pair (two of one suit and two of another): +30 points.
- All-different or single pair only: +10 consolation.

Probabilities favor mixed hands, so most rounds score the +10 base. About 30% of rounds yield a three-of-a-suit. Four of a suit is rare — about 1 in 100 — and feels like a jackpot when it happens.

There are no decisions to make; each round is a pure draw, scored automatically. Average game scores land around 200, but a couple of three-suit rounds plus a quad will push you well past 300. Aim for the cosmic four-suit moment!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SuitShuffleSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-suit-shuffle-primary"]', pulses: 3 }),component:SuitShuffleGame,
};
