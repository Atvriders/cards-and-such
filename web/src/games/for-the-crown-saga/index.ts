import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { ForTheCrownSagaState, ForTheCrownSagaAction, ForTheCrownSagaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ForTheCrownSagaGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const forTheCrownSagaPlugin: GamePlugin<ForTheCrownSagaState, ForTheCrownSagaAction, typeof settings> = {
  id: "for-the-crown-saga",
  title: "For the Crown",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo throne-room intrigue using For the Queen system.",
  howToPlay: "For the Crown is a solo journaling homage to Alex Roberts' For the Queen, reframed in the throne room rather than the field. The original For the Queen is a co-op card-prompt storytelling game where loyal companions answer questions about a sovereign they protect; the final card reveals which of them is a betrayer.\n\nAcross ten throne-room scenes you record your loyalties as a regent's confidant. Each prompt offers four weighted choices (A-D); your pick assigns a base reward plus 0-20 of mulberry32 variance. Choose to defend, conspire, advise, or simply observe.\n\nThis solo digital homage preserves the system's intimate first-person scale while dropping the seat at the table — there is only your voice, and the crown to which it speaks.\n\nIntrigue weighs more in candle-light than in council. Record what you would never say aloud, and let the saga decide whose hand wielded the dagger.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ForTheCrownSagaSettings),
  reducer, isTerminal, hint: (state: ForTheCrownSagaState): HintTarget | null => (state.phase === "choose" ? { selector: '[data-testid="hint-target-for-the-crown-saga-primary"]', pulses: 3 } : null), component: ForTheCrownSagaGame,
};
