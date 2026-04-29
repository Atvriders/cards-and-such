import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DoubleDoubleBonusCasState, DoubleDoubleBonusCasAction, DoubleDoubleBonusCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DoubleDoubleBonusCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const doubleDoubleBonusCasPlugin: GamePlugin<DoubleDoubleBonusCasState, DoubleDoubleBonusCasAction, typeof settings> = {
  id: "double-double-bonus-cas", title: "Double Double Bonus", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Higher kicker bonus video poker.",
  howToPlay: "Double Double Bonus is a video poker variant with enhanced payouts for four-of-a-kind hands depending on the rank and the kicker. Four aces with a 2/3/4 kicker pays the most; four aces alone pays second-highest; other quads pay decreasingly.\n\nIn this single-player version you play fifteen rounds. Press Play each round to deal five cards. Holds are chosen optimally and replacements are drawn. The hand is paid per the DDB paytable.\n\nKey payouts: pair of jacks pays one; two pair one; trips three; straight four; flush six; full house nine; four 5s-Ks pays twenty-five; four 2s-4s pays forty; four aces pays one hundred and sixty; four aces with a 2/3/4 kicker pays four hundred.\n\nA strong total across fifteen rounds is around three hundred. Double Double Bonus is the most popular non-standard video poker game in Vegas and was patented in 1989. Strategy differs from Jacks or Better; specifically you should hold a single ace more often. Press Play and chase aces with kickers.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DoubleDoubleBonusCasSettings),
  reducer, isTerminal, component: DoubleDoubleBonusCasGame,
};
