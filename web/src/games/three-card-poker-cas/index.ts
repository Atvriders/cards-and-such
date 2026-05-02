import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { ThreeCardPokerCasState, ThreeCardPokerCasAction, ThreeCardPokerCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ThreeCardPokerCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: ThreeCardPokerCasState): HintTarget | null => (state.phase === "ready" ? { selector: '[data-testid="hint-target-three-card-poker-cas-primary"]', pulses: 3 } : null);
export const threeCardPokerCasPlugin: GamePlugin<ThreeCardPokerCasState, ThreeCardPokerCasAction, typeof settings> = {
  id: "three-card-poker-cas", title: "Three Card Poker (Casino)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three-card stud casino table game.",
  howToPlay: "Three Card Poker is a popular casino table game where the player makes a three-card poker hand and competes against the dealer. Hand rankings differ slightly from standard poker — a straight beats a flush because flushes are easier with only three cards.\n\nIn this single-player version you play fifteen rounds. Press Play each round to deal three cards to you and the dealer. The dealer qualifies with a queen-high or better. If the dealer qualifies, hands are compared; if not, you win automatically.\n\nKey payouts: high card or pair pays even; flush pays four-to-one bonus; straight pays five-to-one; trips pay thirty-to-one; straight flush pays forty-to-one. A strong total across fifteen rounds is around two hundred.\n\nThree Card Poker was invented by Derek Webb in 1994 and is now one of the most popular casino table games in the United States. The Pair Plus side bet is omitted in this single-decision adaptation. Press Play to deal.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ThreeCardPokerCasSettings),
  reducer, isTerminal, hint, component: ThreeCardPokerCasGame,
};
