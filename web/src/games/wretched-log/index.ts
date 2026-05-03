import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { WretchedLogState, WretchedLogAction, WretchedLogSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WretchedLogGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const wretchedLogPlugin: GamePlugin<WretchedLogState, WretchedLogAction, typeof settings> = {
  id: "wretched-log",
  title: "The Wretched Log",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo journaling homage — a stranded astronaut keeps a final log.",
  howToPlay: "The Wretched Log is a solo journaling homage to Chris Bissette's Wretched, the original Wretched & Alone game. You play the last surviving crew member of a stranded ship, recording transmissions and entries while waiting for a rescue that may never come.\n\nAcross ten entries you choose how to spend your dwindling time — repair, rest, search, transmit. Each choice (A-D) assigns a base reward plus 0-20 of seeded variance via mulberry32. Hopeful choices reward differently from despair, but neither path is wrong; the log itself is the point.\n\nThe original Wretched uses a Jenga tower, dice, and cards to drive a slow descent into hopelessness. This solo digital homage replaces all that with choice-and-roll, while preserving the introspective, eerie tone of being utterly alone in a ship that is dying around you.\n\nWhisper your entries aloud if you like. Either way, the log endures longer than you do.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WretchedLogSettings),
  reducer, isTerminal, hint: (state: WretchedLogState): HintTarget | null => (state.phase === "choose" ? { selector: '[data-testid="hint-target-wretched-log-primary"]', pulses: 3 } : null), component: WretchedLogGame,
};
