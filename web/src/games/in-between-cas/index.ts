import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { InBetweenCasState, InBetweenCasAction, InBetweenCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { InBetweenCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: InBetweenCasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-in-between-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-in-between-cas-secondary"]', pulses: 3 };
  return null;
};
export const inBetweenCasPlugin: GamePlugin<InBetweenCasState, InBetweenCasAction, typeof settings> = {
  id: "in-between-cas", title: "In-Between", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bet on whether the next card falls between two flipped cards.",
  howToPlay: "In-Between, also called Acey-Deucey or Yablon, is a casino-style spread game. Two cards are flipped face up, and you bet that the next card falls strictly between them in rank. The wider the spread, the easier the win — but the lower the payout.\n\nEach round, the engine flips two cards. The spread is the count of ranks strictly between the two. You then place a one-credit bet and a third card is drawn. If it falls in the spread, you win; if it matches either bracket card, you lose double; otherwise you lose your bet.\n\nTwelve rounds are played. The payout scales inversely with the spread: a 9-spread pays five points; a 5-8 spread pays twelve; a 2-4 spread pays twenty; a 1-spread pays fifty (very rare). A bracket-match (post on either flipped card) pays zero (a double-loss in casinos).\n\nExpected score is around forty-five to sixty points; a few small-spread wins can push past 150, but small spreads also lose the most often. The wider the gap, the safer the bet — and the smaller the prize.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as InBetweenCasSettings),
  reducer, isTerminal, hint: hint, component: InBetweenCasGame,
};
