import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { JokerPokerCasState, JokerPokerCasAction, JokerPokerCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { JokerPokerCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: JokerPokerCasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-joker-poker-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-joker-poker-cas-secondary"]', pulses: 3 };
  return null;
};
export const jokerPokerCasPlugin: GamePlugin<JokerPokerCasState, JokerPokerCasAction, typeof settings> = {
  id: "joker-poker-cas", title: "Joker Poker (Casino)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Video poker with joker wild.",
  howToPlay: "Joker Poker is a video poker variant played with a fifty-three-card deck including a single joker that is fully wild. The wild joker shifts the strategy toward making higher-ranked hands and slightly devalues low pairs.\n\nIn this single-player version you play fifteen rounds. Press Play each round to deal five cards including a possible joker. Optimal holds are chosen and replacements drawn. The hand is paid per the Joker Poker paytable.\n\nKey payouts: kings or better pair pays one; two pair one; trips two; straight three; flush five; full house seven; four of a kind seventeen; straight flush fifty; five of a kind two hundred; royal flush (no joker) one thousand; joker royal flush one hundred.\n\nThe minimum qualifying hand is kings or better — pairs of jacks and queens do not pay. A strong total across fifteen rounds is around three hundred. Joker Poker first appeared in 1985 IGT machines. Press Play to chase the wild joker.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as JokerPokerCasSettings),
  reducer, isTerminal, hint: hint, component: JokerPokerCasGame,
};
