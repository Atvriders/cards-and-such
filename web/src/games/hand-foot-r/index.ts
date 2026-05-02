import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HandFootRState, HandFootRAction, HandFootRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HandFootRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const handFootRPlugin: GamePlugin<HandFootRState, HandFootRAction, typeof settings> = {
  id: "hand-foot-r", title: "Hand and Foot", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Canasta variant with two hands per player: a hand and a foot.",
  howToPlay: "Hand and Foot is a Canasta variant where each player receives two hands of eleven cards: a Hand played first and a Foot played after the Hand is finished. Play continues until both have been emptied, doubling melding opportunities.\n\nIn this single-player drill, four rounds approximate two-stack play with eleven-card hands. The engine auto-melds your hand into rank-sets and same-suit runs. Aces count one for value, pip cards face value, faces count ten. Sets are three-or-more matching ranks; runs are three-or-more consecutive same-suit cards.\n\nA matched meld pays eighteen base plus six per extra card. With no melds you receive a small consolation. Going out earns thirty bonus. Long melds compound nicely; aim for one seven-card canasta-equivalent.\n\nExpected score across four rounds is fifty-five to ninety-five. Hand and Foot's signature is sustained melding across two stacks — the drill captures this with consistent eleven-card hands. Two melds per round on average lands you in the upper half of the band.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HandFootRSettings),
  reducer, isTerminal, 
  hint: (state: HandFootRState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-hand-foot-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-hand-foot-r-next"]', pulses: 3 };
    return null;
  },
  component: HandFootRGame,
};
