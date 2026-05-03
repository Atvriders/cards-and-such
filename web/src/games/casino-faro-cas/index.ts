import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { CasState, CasAction, CasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CasGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

const hint = (state: CasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-casino-faro-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-casino-faro-cas-secondary"]', pulses: 3 };
  return null;
};
export const casinoFaroCasPlugin: GamePlugin<CasState, CasAction, typeof settings> = {
  id: "casino-faro-cas",
  title: "Casino Faro",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic 19th-century banking card game.",
  howToPlay: "Casino Faro is a classic nineteenth-century banking card game where players bet on which card rank will appear next from a face-down deck. The game was the dominant casino card game in the United States during the Wild West era before being eclipsed by Blackjack and Poker.\n\nIn this single-player adaptation you play fifteen rounds against the bank. Press Play each round to draw two cards: a 'losing' card and a 'winning' card from the dealer's two-card draw. You implicitly bet a target rank; if the winning card matches your target the bank pays you, if the losing card matches you pay the bank, otherwise it pushes. A correct call pays sixteen; a push pays four; a loss pays zero. Press Next after each result.\n\nExpected score across fifteen rounds is forty to one hundred. Casino Faro fell out of fashion when the casino edge was found to be negligible — the game is famously close to even. The dealing-table layout is one of the most iconic in casino history. Place your bets and let the deck speak.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CasSettings),
  reducer,
  isTerminal,
  hint: hint, component: CasGame,
};
