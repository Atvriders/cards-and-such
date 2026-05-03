import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { AllAmericanVpCasState, AllAmericanVpCasAction, AllAmericanVpCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AllAmericanVpCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: AllAmericanVpCasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-all-american-vp-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-all-american-vp-cas-secondary"]', pulses: 3 };
  return null;
};
export const allAmericanVpCasPlugin: GamePlugin<AllAmericanVpCasState, AllAmericanVpCasAction, typeof settings> = {
  id: "all-american-vp-cas", title: "All American Video Poker", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "VP variant favoring flushes/straights.",
  howToPlay: "All American Video Poker is a Jacks or Better variant with enhanced payouts for flushes, straights, and straight flushes — at the cost of reduced full house and four-of-a-kind payouts. The strategy shifts toward chasing draws.\n\nIn this single-player version you play fifteen rounds. Press Play each round to deal five cards. The optimal-hold simulation picks your holds and draws replacements. The hand is paid per the All American paytable.\n\nKey payouts: pair of jacks pays one; two pair one; trips three; straight eight; flush eight; full house eight; quads forty; straight flush two hundred; royal flush eight hundred.\n\nThe boosted straight and flush payouts make four-card straights and flushes much more valuable to hold. A strong total across fifteen rounds is around three hundred.\n\nAll American was originally an early-1980s Sigma Game Inc. machine and is no longer common in casinos but lives on in online video poker and home video poker collections. Press Play to deal.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AllAmericanVpCasSettings),
  reducer, isTerminal, hint: hint, component: AllAmericanVpCasGame,
};
