import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardTrioBuildState, CardTrioBuildAction, CardTrioBuildSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardTrioBuildGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardTrioBuildPlugin: GamePlugin<CardTrioBuildState, CardTrioBuildAction, typeof settings> = {
  id:"card-trio-build", title:"Card Trio Build", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Build trios of same-rank cards from a hand of six over 18 draws.",
  howToPlay:`Card Trio Build is a hand-management deck game over 18 draws. You have a hand limit of 6 cards. On each turn you choose: Draw a fresh card from the deck (counts toward your 18-draw cap), Build a trio of three same-rank cards in hand for 30 points, or Discard a card you don't want for a 1-point penalty.

When three of any rank sit in your hand, a Build button appears. Hit it to fold the three into the trio pile and free up hand space for new draws.

Strategy: don't get stuck with a hand of singletons. If you've already pulled three of a rank, build immediately to clear room. Discarding for -1 is far cheaper than running out the clock with unbuilt cards in hand.

Scoring: +30 per trio (max 6 trios = 180), -1 per discard. The 18-draw limit caps theoretical builds at 6, but realistic runs land between 2 and 4 trios. Aim for 90+ for a strong showing.

Click any card in your hand to discard it. Click Draw to fill in. Build when ready.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardTrioBuildSettings),
  reducer, isTerminal, component: CardTrioBuildGame,
};
