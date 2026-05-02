import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { CasState, CasAction, CasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CasGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

const hint = (state: CasState): HintTarget | null => (state.phase === "ready" ? { selector: '[data-testid="hint-target-seven-card-stud-hi-lo-cas-primary"]', pulses: 3 } : null);
export const sevenCardStudHiLoCasPlugin: GamePlugin<CasState, CasAction, typeof settings> = {
  id: "seven-card-stud-hi-lo-cas",
  title: "Seven-Card Stud Hi-Lo",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Stud with split pot for low qualifier.",
  howToPlay: "Seven-Card Stud Hi-Lo (Eight or Better) is a split-pot stud variant where each player receives seven cards and the pot splits between the best high hand and the best qualifying low hand (lowest five cards, eight or lower). Without an eight-or-lower the high hand scoops.\n\nIn this single-player adaptation you play twelve rounds against the dealer. Press Play each round to deal seven cards each. The engine evaluates both the high (standard ranking) and the low (eight-low qualifier) for both you and the dealer. Winning either side pays seven; winning both (scooping) pays sixteen; tie pays four; loss pays zero. Press Next after each result.\n\nExpected score across twelve rounds is fifty to one hundred. Seven-Card Stud Hi-Lo is a staple of mixed-game rotations like HORSE and SHOE. The strategy splits between high-only and scoop-attempt patterns. Look for low draws that can swing both ways.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CasSettings),
  reducer,
  isTerminal,
  hint, component: CasGame,
};
