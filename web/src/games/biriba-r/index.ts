import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BiribaRState, BiribaRAction, BiribaRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BiribaRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const biribaRPlugin: GamePlugin<BiribaRState, BiribaRAction, typeof settings> = {
  id: "biriba-r", title: "Biriba", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Greek partnership rummy with melding and discard rules.",
  howToPlay: "Biriba is a Greek partnership rummy in the Canasta family, played with two decks plus jokers. Partners build melds together and pursue clean canastas without wilds for premium bonuses. The game has a strong following in Mediterranean countries.\n\nIn this single-player drill, five rounds approximate Biriba's flow with an eleven-card hand. The engine auto-melds your hand into rank-sets and same-suit runs. Aces count one for value, pip cards face value, faces count ten. Sets are three-or-more matching ranks; runs are three-or-more consecutive same-suit cards.\n\nA matched meld pays eighteen base plus six per extra card. With no melds you collect a small consolation. Going out earns thirty bonus.\n\nExpected score across five rounds is sixty to one hundred. Biriba's partnership flavour is approximated by the steady scoring rate. The clean-canasta premium is reflected in the long-meld bonus; aim for one seven-card sequence to push toward the upper band.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BiribaRSettings),
  reducer, isTerminal, 
  hint: (state: BiribaRState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-biriba-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-biriba-r-next"]', pulses: 3 };
    return null;
  },
  component: BiribaRGame,
};
