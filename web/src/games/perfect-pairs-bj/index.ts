import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PerfectPairsBjState, PerfectPairsBjAction, PerfectPairsBjSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PerfectPairsBjGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const perfectPairsBjPlugin: GamePlugin<PerfectPairsBjState, PerfectPairsBjAction, typeof settings> = {
  id: "perfect-pairs-bj", title: "Perfect Pairs Blackjack", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Blackjack with a pairs side bet — score bonuses if the first two cards match.",
  howToPlay: "Perfect Pairs is a Blackjack variant featuring a popular side bet. In addition to the main hand, your first two dealt cards may form a pair, paying out as follows: same rank but mixed suits scores ten points; same rank and same colour scores twenty points; identical rank and suit (a perfect pair) scores forty points.\n\nEach round you place a one-credit bet, are dealt two cards, and the dealer shows one upcard. You then hit or stand. The dealer hits on sixteen and stands on seventeen, using standard card values.\n\nTwelve rounds are played. A win on the main hand pays twelve points; a tie pays six. Any pair bonus is added on top of the main result. A side-bet pair without winning the main hand still scores the side amount. A loss with no pair pays zero.\n\nExpected score is around fifty-five to seventy points across twelve rounds; perfect-pair miracles can push above eighty in a single hand. Pair frequency: any pair lands roughly seven per cent of hands; perfect pairs only one per cent. They are rare but lucrative.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PerfectPairsBjSettings),
  reducer, isTerminal, component: PerfectPairsBjGame,
};
