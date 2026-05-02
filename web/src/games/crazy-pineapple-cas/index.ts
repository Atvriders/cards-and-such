import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { CasState, CasAction, CasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CasGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

const hint = (state: CasState): HintTarget | null => (state.phase === "ready" ? { selector: '[data-testid="hint-target-crazy-pineapple-cas-primary"]', pulses: 3 } : null);
export const crazyPineappleCasPlugin: GamePlugin<CasState, CasAction, typeof settings> = {
  id: "crazy-pineapple-cas",
  title: "Crazy Pineapple",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pineapple variant where you discard one of three hole cards after the flop.",
  howToPlay: "Crazy Pineapple is a Pineapple Hold'em variant where each player begins with three hole cards and must discard one after the flop is dealt and the second betting round completes. The pre-flop and flop bets are placed with all three cards in hand, adding informational complexity.\n\nIn this single-player adaptation you play twelve rounds against the dealer. Press Play each round to deal three holes plus a five-card community board; an automatic best-keep selection picks your strongest two of three. The hand evaluates against the dealer's hand: a stronger five-card combo pays twelve, equal pays five, weaker pays zero. Press Next after each result.\n\nExpected score across twelve rounds is forty to one hundred. Crazy Pineapple's three-hole-card pre-flop play makes draws much more common than Hold'em — three holes give multiple drawing patterns. The discard timing is the 'crazy' part since you must commit chips before reducing your hand. The variant is popular in mixed-game cash games and home-game stud rotations.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CasSettings),
  reducer,
  isTerminal,
  hint, component: CasGame,
};
