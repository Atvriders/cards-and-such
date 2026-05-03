import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CasState, CasAction, CasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CasGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

const hint = (state: CasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-jackpots-poker-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-jackpots-poker-secondary"]', pulses: 3 };
  return null;
};

export const jackpotsPokerPlugin: GamePlugin<CasState, CasAction, typeof settings> = {
  id: "jackpots-poker",
  title: "Jackpots (Five-Draw)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draw poker requiring jacks-or-better to open.",
  howToPlay: "Jackpots is a five-card draw poker variant where the opening bettor must hold a pair of jacks or better to legally open the round; if no one can open, antes carry over and the hand redeals.\n\nIn this single-player adaptation you play twelve rounds against the dealer. Press Play each round to deal five-card hands to both you and the dealer. The engine checks if your hand qualifies as jacks-or-better; if so the round resolves at a higher bonus rate. Stronger hand against the dealer pays as follows: qualifying-jacks pair pays four, two pair pays nine, trips fifteen, straight twenty, flush twenty-five, full house thirty-five, quads sixty, straight flush one hundred fifty. Non-qualifying hand pays only one for a win and zero otherwise. Press Next after each result.\n\nExpected score across twelve rounds is forty to one hundred. Jackpots was the first poker variant to feature a qualifying rule, popularized in the 1860s. The opener-must-have-jacks rule prevents 'cold' rounds where no one bets and led to bigger pots when someone qualified. Aim high.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CasSettings),
  reducer, isTerminal, hint: hint, component: CasGame,
};
