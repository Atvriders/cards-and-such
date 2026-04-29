import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EuropeanBjState, EuropeanBjAction, EuropeanBjSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EuropeanBjGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const europeanBjPlugin: GamePlugin<EuropeanBjState, EuropeanBjAction, typeof settings> = {
  id: "european-bj", title: "European Blackjack", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "European no-hole-card Blackjack against the dealer.",
  howToPlay: "European Blackjack uses a no-hole-card rule: the dealer takes only one upcard until the player finishes their turn, then draws their own second card. The variant marginally favours the house but flows faster.\n\nIn each of twelve rounds you receive two cards and see one dealer upcard. You may hit (take more) or stand (end your turn). Aces count eleven (or one if you would otherwise bust); pip cards face value; faces count ten. Going over twenty-one busts immediately for zero.\n\nA standard win pays twelve points; a push pays five; a Blackjack (twenty-one on the first two cards) pays eighteen. The dealer plays automatically: hit until seventeen-or-more, then stand.\n\nExpected score across twelve rounds is fifty-five to ninety. The no-hole-card flavour is approximated by the simpler turn flow. Standard Blackjack basic strategy applies: stand on hard seventeen-or-more, hit on hard twelve-or-less, and lean conservative with low dealer upcards.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as EuropeanBjSettings),
  reducer, isTerminal, component: EuropeanBjGame,
};
