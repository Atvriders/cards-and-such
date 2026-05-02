import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MichiganRumRState, MichiganRumRAction, MichiganRumRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MichiganRumRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const michiganRumRPlugin: GamePlugin<MichiganRumRState, MichiganRumRAction, typeof settings> = {
  id: "michigan-rum-r", title: "Michigan Rum", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "500 Rum variant with stops-style chip-based bonuses.",
  howToPlay: "Michigan Rum is a hybrid that grafts elements of the stops-game family (where premium cards earn chips) onto 500 Rum's capture-style scoring. The result is a melding game with side payouts on specific high cards.\n\nIn this single-player drill, seven rounds are played and the engine auto-melds your seven-card hand into sets and runs. Aces count one for value, pip cards face value, faces count ten. Sets are three or more of a rank; runs are three or more consecutive same-suit cards.\n\nA matched meld pays eighteen base plus six per extra card. No melds produces a small consolation. Going out adds thirty bonus points.\n\nExpected score across seven rounds is sixty to ninety-five. Michigan's stops-style flavour rewards keeping high cards alive — pairs of jacks, queens, kings, and aces feed quartets when an extra falls in. The cleanest path to the high band is a four-of-a-kind round combined with one or two other small melds.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MichiganRumRSettings),
  reducer, isTerminal, 
  hint: (state: MichiganRumRState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-michigan-rum-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-michigan-rum-r-next"]', pulses: 3 };
    return null;
  },
  component: MichiganRumRGame,
};
