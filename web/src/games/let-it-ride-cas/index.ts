import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { LetItRideCasState, LetItRideCasAction, LetItRideCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LetItRideCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: LetItRideCasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-let-it-ride-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-let-it-ride-cas-secondary"]', pulses: 3 };
  return null;
};
export const letItRideCasPlugin: GamePlugin<LetItRideCasState, LetItRideCasAction, typeof settings> = {
  id: "let-it-ride-cas", title: "Let It Ride (Casino)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Stud poker with optional pull-back bets.",
  howToPlay: "Let It Ride is a casino table game where the player makes three equal bets at the start, and may pull back two of them if their hand looks weak as community cards are revealed. Five cards total form the final hand.\n\nIn this single-player version you play fifteen rounds. Press Play each round to deal three cards to you and two community cards face down. Decide whether to 'let it ride' or pull back the first bet, then again on the second bet, then reveal the rest.\n\nKey payouts: pair of tens or better pays even; two pair pays two; trips pay three; straight pays five; flush pays eight; full house pays eleven; four of a kind pays fifty; straight flush pays two hundred; royal flush pays one thousand.\n\nA strong total across fifteen rounds is around two hundred and fifty. The optimal strategy lets it ride only when holding strong cards. Let It Ride was invented by John Breeding in 1993. Press Play to deal.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LetItRideCasSettings),
  reducer, isTerminal, hint: hint, component: LetItRideCasGame,
};
