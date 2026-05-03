import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { CasState, CasAction, CasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CasGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

const hint = (state: CasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-flush-poker-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-flush-poker-cas-secondary"]', pulses: 3 };
  return null;
};
export const flushPokerCasPlugin: GamePlugin<CasState, CasAction, typeof settings> = {
  id: "flush-poker-cas",
  title: "Flush (Indian Poker)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Indian three-card poker variant focused on flushes.",
  howToPlay: "Flush is an Indian three-card poker variant where players each receive three cards and the strongest flush (or pure same-suit hand) wins. Hand rankings differ from Western three-card poker: pure suit (flush) outranks straight, and straight flushes are the strongest hand.\n\nIn this single-player adaptation you play twelve rounds against the dealer. Press Play each round to deal three cards each. The engine evaluates Flush rankings: trail (trips) pays sixteen, pure sequence (straight flush) pays twelve, sequence (straight) pays six, color (flush) pays five, pair pays three, high card pays one if you beat the dealer. Otherwise zero. Press Next after each result.\n\nExpected score across twelve rounds is forty to one hundred. Flush is a sub-variant of the more popular Teen Patti played mainly in northern India and parts of Pakistan. The flush-prioritized rankings reward suited starting cards more than Western poker. Aim for flushes; trail is rare but huge.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CasSettings),
  reducer,
  isTerminal,
  hint: hint, component: CasGame,
};
