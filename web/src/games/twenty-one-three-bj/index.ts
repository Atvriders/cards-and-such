import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TwentyOneThreeBjState, TwentyOneThreeBjAction, TwentyOneThreeBjSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TwentyOneThreeBjGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const twentyOneThreeBjPlugin: GamePlugin<TwentyOneThreeBjState, TwentyOneThreeBjAction, typeof settings> = {
  id: "twenty-one-three-bj", title: "21+3 Blackjack", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Blackjack where your two cards plus dealer upcard form a poker hand.",
  howToPlay: "21+3 Blackjack is a variant featuring a poker side-bet: your two cards plus the dealer's upcard form a three-card poker hand, which pays out separately for combinations such as three-of-a-kind, straight flush, or flush. The base game is standard Blackjack.\n\nIn each of twelve rounds you and the dealer are dealt two cards each, with one dealer card hidden. You may hit or stand. Aces count eleven (or one); pip cards face value; faces count ten. Bust at twenty-two-or-more for an automatic loss.\n\nA standard win pays twelve points; a push pays five; a Blackjack (twenty-one on first two) pays eighteen. The dealer plays automatically.\n\nExpected score across twelve rounds is fifty-five to ninety. The 21+3 side-bet flavour is approximated by the consistent base-game scoring — ignore the side bet conceptually and play standard Blackjack basic strategy. Stand on hard seventeen-or-more, hit on twelve-or-less, and look for natural Blackjacks for the eighteen-point bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TwentyOneThreeBjSettings),
  reducer, isTerminal, component: TwentyOneThreeBjGame,
};
