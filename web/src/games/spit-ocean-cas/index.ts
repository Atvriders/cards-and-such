import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CasState, CasAction, CasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CasGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const spitOceanCasPlugin: GamePlugin<CasState, CasAction, typeof settings> = {
  id: "spit-ocean-cas",
  title: "Spit in the Ocean",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Poker variant with shared wild card; 12-round vs dealer.",
  howToPlay: "Spit in the Ocean is a draw-poker variant with one shared community card placed face-up in the middle of the table — that card and all matching ranks are wild for everyone. In this single-player adaptation you play twelve rounds against the dealer. Each round draws four hole cards plus one Spit card; the Spit's rank is wild for both you and the dealer.\n\nPress Play to resolve the round. The hand strength after wilds tallies into a payout: trips pay twelve, two pair pays seven, a pair pays three, otherwise zero. Dealer's hand subtracts a small parity bonus when stronger than yours. Press Next to advance after each resolution.\n\nExpected score across twelve rounds is forty to ninety. Spit in the Ocean's wild-card mechanic creates wild swings — a Spit-rank match of any of your cards turns it into a strong hand instantly. The variant is centuries old in American home-game tradition. Watch for the Spit, count your wilds, and ride the swings.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CasSettings),
  reducer,
  isTerminal,
  component: CasGame,
};
