import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { CasState, CasAction, CasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CasGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

const hint = (state: CasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-mississippi-stud-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-mississippi-stud-cas-secondary"]', pulses: 3 };
  return null;
};
export const mississippiStudCasPlugin: GamePlugin<CasState, CasAction, typeof settings> = {
  id: "mississippi-stud-cas",
  title: "Mississippi Stud (Casino)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Casino stud with raise-after-each-board-card; pair-or-better pays.",
  howToPlay: "Mississippi Stud is a casino table stud where players make an Ante and may raise after each of three board cards revealed sequentially. The final five-card hand (two hole + three community) pays per a pair-or-better paytable — pairs of sixes through tens push, jacks-or-better pay one-to-one, two pair pays two-to-one, trips four-to-one, straight six-to-one, flush ten-to-one, full house ten-to-one, quads forty-to-one, straight flush one-hundred-to-one, royal flush five-hundred-to-one.\n\nIn this single-player adaptation you play twelve rounds. Press Play each round to deal two holes plus three communities; the engine evaluates the final five-card hand and pays per the simplified table (pair-or-better=4, two-pair=10, trips=20, straight=30, flush=50, full house=60, quads=120, straight flush=300, royal=500). Press Next after each result.\n\nExpected score across twelve rounds is forty to one hundred. Mississippi Stud is a high-volatility casino game without an opponent at the table — pure paytable play. Most rounds clear Pair-of-Jacks easily; the big payouts are rare but huge.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CasSettings),
  reducer,
  isTerminal,
  hint: hint, component: CasGame,
};
