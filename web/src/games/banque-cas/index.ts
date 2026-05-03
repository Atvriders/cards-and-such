import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { BanqueCasState, BanqueCasAction, BanqueCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BanqueCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: BanqueCasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "bet") return { selector: '[data-testid="hint-target-banque-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-banque-cas-secondary"]', pulses: 3 };
  return null;
};
export const banqueCasPlugin: GamePlugin<BanqueCasState, BanqueCasAction, typeof settings> = {
  id: "banque-cas", title: "Baccarat Banque", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Baccarat Banque — fixed banker variant.",
  howToPlay: "Baccarat Banque — fixed banker variant. Bet on Player, Banker, or Tie. Cards drawn following baccarat rules. Higher of two totals (mod 10) wins. Player pays 20, Banker pays 19, Tie pays 80.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as BanqueCasSettings),
  reducer, isTerminal, hint: hint, component: BanqueCasGame,
};
