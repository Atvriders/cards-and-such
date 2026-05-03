import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { JackpotsDrawState, JackpotsDrawAction, JackpotsDrawSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { JackpotsDrawGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const jackpotsDrawPlugin: GamePlugin<JackpotsDrawState, JackpotsDrawAction, typeof settings> = {
  id: "jackpots-draw", title: "Jackpots Draw Poker", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Five-card draw requiring jacks-or-better to open.",
  howToPlay: "Jackpots is a five-card draw poker variant requiring openers of a pair of jacks or better. Without openers, the round is folded automatically. The variant ensures that every played round has at least moderate hand strength.\n\nIn this single-player adaptation you play against the dealer over twelve rounds. Each round you are dealt five cards. The engine evaluates your hand and pays out according to a poker-rank schedule: pair of jacks-or-better pays one point, two pair pays two, three-of-a-kind pays three, straight four, flush six, full house nine, four-of-a-kind twenty-five, straight flush fifty, royal flush two hundred and fifty.\n\nLow pairs (twos through tens) pay nothing — the jacks-or-better requirement is preserved.\n\nExpected score across twelve rounds is twenty-five to fifty. Jackpots' open-only-on-jacks rule produces sparse but spiky scoring; expect five-or-six rounds with no payout. A single full house or better can dominate the total. The sharp tail toward big payouts is what makes this game memorable.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as JackpotsDrawSettings),
  reducer, isTerminal,   hint: (state: JackpotsDrawState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-jackpots-draw-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-jackpots-draw-next"]', pulses: 3 };
    return null;
  },
  component: JackpotsDrawGame,
};
