import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MultiHandBjState, MultiHandBjAction, MultiHandBjSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MultiHandBjGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const multiHandBjPlugin: GamePlugin<MultiHandBjState, MultiHandBjAction, typeof settings> = {
  id: "multi-hand-bj", title: "Multi-Hand Blackjack", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Standard Blackjack with extra rounds simulating multi-hand play.",
  howToPlay: "Multi-Hand Blackjack lets a single player play three or more hands simultaneously against one dealer hand, multiplying both risk and reward per dealer cycle. In this single-stream adaptation the multi-hand intensity is reproduced via a longer fifteen-round set.\n\nIn each round you and the dealer are dealt two cards each. You may hit or stand. Aces count eleven (or one if you would otherwise bust); pip cards face value; faces count ten. Bust at twenty-two-or-more for an automatic loss.\n\nA standard win pays twelve points; a push pays five; a Blackjack (twenty-one on the first two cards) pays eighteen. The dealer plays automatically to seventeen-or-more.\n\nExpected score across fifteen rounds is sixty-five to one hundred. The longer round set replicates the volume of multi-hand play. Standard Blackjack basic strategy still applies: stand on hard seventeen-or-more, hit on twelve-or-less. Across fifteen hands you should see one or two natural Blackjacks — those are the swing points.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MultiHandBjSettings),
  reducer, isTerminal, component: MultiHandBjGame,
};
