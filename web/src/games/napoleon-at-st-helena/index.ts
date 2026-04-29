import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NapoleonAtStHelenaState, NapoleonAtStHelenaAction, NapoleonAtStHelenaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NapoleonAtStHelenaGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const napoleonAtStHelenaPlugin: GamePlugin<NapoleonAtStHelenaState, NapoleonAtStHelenaAction, typeof settings> = {
  id:"napoleon-at-st-helena", title:"Napoleon at St. Helena", category:"solitaire",
  players:{ min:1, max:1, multiplayer:false },
  description:"A 10-round solitaire micro-variant inspired by Napoleon at St. Helena: Forty Thieves classic: ten columns, two decks, build by suit, single stock draw.",
  howToPlay:"Napoleon at St. Helena is a compact 10-round solitaire micro-variant inspired by the classic patience: Forty Thieves classic: ten columns, two decks, build by suit, single stock draw. Each round you receive a fresh hand of five cards drawn from a single seeded 52-card deck. You then choose one of three actions.\n\nKeep & Score locks the current hand and awards points based on face cards, pairs, ascending runs, and same-suit flushes, with a small variant-specific bonus that captures the flavor of Napoleon at St. Helena. Discard Hand abandons it for a flat one-point consolation and rolls into the next round. Swap consumes the next deck card to replace any single card in the visible hand without ending the round, which is your main tactical lever for shaping a strong Keep.\n\nScores compound across all ten rounds. Disciplined swap usage and well-timed Keeps will push your total well past a typical run. The game ends when ten rounds elapse or the deck runs out, and your final score is rated Pass, Fair, Good, or Excellent. Deals are fully seeded so identical seeds always produce identical card orders for fair comparison and replay.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NapoleonAtStHelenaSettings),
  reducer,isTerminal,component:NapoleonAtStHelenaGame,
};
