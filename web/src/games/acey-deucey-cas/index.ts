import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AceyDeuceyCasState, AceyDeuceyCasAction, AceyDeuceyCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AceyDeuceyCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: AceyDeuceyCasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-acey-deucey-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-acey-deucey-cas-secondary"]', pulses: 3 };
  return null;
};
export const aceyDeuceyCasPlugin: GamePlugin<AceyDeuceyCasState, AceyDeuceyCasAction, typeof settings> = {
  id: "acey-deucey-cas", title: "Acey-Deucey Casino", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Casino spread game — bet that the next card lands between two given cards.",
  howToPlay: "Acey-Deucey is a casino spread game close to In-Between or Red Dog. The engine flips two cards. The spread is the count of ranks strictly between them. You then place a one-credit bet and a third card is drawn. If it falls inside the spread, you win.\n\nEach round you may also pump the bet ahead of the third draw; in this short version the bet is fixed at one credit per round. If the third card matches either bracket card, you lose double (post). If it falls outside the spread, you lose your bet. Spread of zero means the two cards match — that round automatically pushes.\n\nTwelve rounds are played. Payouts scale inversely with the spread: 9-spread pays five points, 5-8 spread pays twelve, 2-4 spread pays twenty, 1-spread pays fifty. Posts pay zero. Pushes pay six (half the bet returned).\n\nExpected score is around forty-five to fifty-five points; a few middle-spread wins can push past 100. The variant is luck-only — there are no decisions to gamble with. Watching the third card fall is the entire ride.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AceyDeuceyCasSettings),
  reducer, isTerminal, hint: hint, component: AceyDeuceyCasGame,
};
