import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DoubleAttackBjState, DoubleAttackBjAction, DoubleAttackBjSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DoubleAttackBjGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const doubleAttackBjPlugin: GamePlugin<DoubleAttackBjState, DoubleAttackBjAction, typeof settings> = {
  id: "double-attack-bj", title: "Double Attack Blackjack", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Blackjack where players see the dealer's first card before betting.",
  howToPlay: "Double Attack Blackjack is a variant where the player sees the dealer's first card before placing their bet, optionally doubling their bet after seeing it. Played with a Spanish 21 deck (no 10s), it offers a different odds profile than standard Blackjack.\n\nIn this single-player adaptation you play twelve rounds with a standard fifty-two-card deck for simplicity. Each round you and the dealer are dealt two cards, with one dealer card hidden. You may hit or stand. Aces count eleven (or one to avoid bust); pip cards face value; faces count ten.\n\nA standard win pays twelve points; a push pays five; a Blackjack (twenty-one on the first two cards) pays eighteen. The dealer plays automatically to seventeen-or-more.\n\nExpected score across twelve rounds is fifty-five to ninety. Double Attack's signature is the post-upcard double — approximated here by treating every win as worth a standard payout. Pre-emptively standing on hard fifteen against a low dealer upcard is recommended in the original; basic strategy is the right starting point.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DoubleAttackBjSettings),
  reducer, isTerminal, component: DoubleAttackBjGame,
};
