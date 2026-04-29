import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CasState, CasAction, CasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CasGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const fortunePaiGowCasPlugin: GamePlugin<CasState, CasAction, typeof settings> = {
  id: "fortune-pai-gow-cas",
  title: "Fortune Pai Gow",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pai Gow Poker with bonus side bets.",
  howToPlay: "Fortune Pai Gow is the Pai Gow Poker (with-joker) variant that adds a Fortune side bet paying for any seven-card hand of trips or better. The base game splits seven cards into a five-card high hand and a two-card low hand against a banker; both must beat the banker's hands for a payout.\n\nIn this single-player adaptation you play twelve rounds against the dealer-banker. Press Play each round to deal seven cards each. The engine auto-splits both hands optimally. Winning both hands pays eight; pushing one and winning one pays three; both push pays one; losing pays zero. Fortune side bet pays one for trips, three for straights, four for flushes, six for full houses, ten for quads, twenty for straight flush, fifty for five aces. Press Next after each result.\n\nExpected score across twelve rounds is fifty to one hundred. Fortune Pai Gow is popular in California and Nevada casinos for its hit-frequency on the side bet. The base game is famously low-volatility (~40% pushes) so the side bet adds excitement.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CasSettings),
  reducer,
  isTerminal,
  component: CasGame,
};
