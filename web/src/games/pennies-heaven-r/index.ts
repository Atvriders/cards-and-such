import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PenniesHeavenRState, PenniesHeavenRAction, PenniesHeavenRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PenniesHeavenRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const penniesHeavenRPlugin: GamePlugin<PenniesHeavenRState, PenniesHeavenRAction, typeof settings> = {
  id: "pennies-heaven-r", title: "Pennies from Heaven", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Canasta variant with a special bonus reward hand.",
  howToPlay: "Pennies from Heaven is a Canasta variant where each player has a separate reward hand of eleven cards earned by completing canastas, providing a second melding opportunity. Going out requires both hands to be substantially melded.\n\nIn this single-player drill, four rounds approximate the play with an eleven-card hand each round. The engine auto-melds rank-sets and same-suit runs. Aces count one for value, pip cards face value, faces count ten. Sets are three-or-more of a rank; runs are three-or-more consecutive same-suit cards.\n\nA matched meld pays eighteen base plus six per extra card. With no melds you take a small consolation. Going out earns thirty bonus. Long sequences carry premium pay.\n\nExpected score across four rounds is fifty-five to ninety. The reward-hand mechanic is approximated by the long-meld bonus — chase one big sequence per round on top of standard sets. Two melds in three of the four rounds puts you firmly in the upper band.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PenniesHeavenRSettings),
  reducer, isTerminal, 
  hint: (state: PenniesHeavenRState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-pennies-heaven-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-pennies-heaven-r-next"]', pulses: 3 };
    return null;
  },
  component: PenniesHeavenRGame,
};
