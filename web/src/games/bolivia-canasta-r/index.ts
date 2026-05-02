import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BoliviaCanastaRState, BoliviaCanastaRAction, BoliviaCanastaRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BoliviaCanastaRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const boliviaCanastaRPlugin: GamePlugin<BoliviaCanastaRState, BoliviaCanastaRAction, typeof settings> = {
  id: "bolivia-canasta-r", title: "Bolivia Canasta", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three-deck Canasta variant emphasizing wild canastas.",
  howToPlay: "Bolivia Canasta is a Canasta variant played with three decks and three jokers per deck, encouraging higher-card-count melds and wild canastas. Long sequences carry premium scoring.\n\nIn this single-player drill, five rounds are played from an eleven-card hand. The engine auto-melds your hand into sets and runs. Aces count one for value, pip cards face value, faces count ten. Sets are three-or-more of a rank; runs are three-or-more consecutive same-suit cards.\n\nA matched meld pays eighteen base plus six per extra card. Long melds (canasta-equivalents at seven cards or more) compound nicely. With no melds you receive a small deadwood-tied consolation. Going out adds thirty bonus.\n\nExpected score across five rounds is sixty-five to one hundred and ten. Bolivia's deeper deck approximation favours run-heavy strategies; aim for two long sequences across the five rounds plus filler sets to hit the upper band. The wild-canasta bonus is approximated by extra-card pay-out.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BoliviaCanastaRSettings),
  reducer, isTerminal, 
  hint: (state: BoliviaCanastaRState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-bolivia-canasta-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-bolivia-canasta-r-next"]', pulses: 3 };
    return null;
  },
  component: BoliviaCanastaRGame,
};
