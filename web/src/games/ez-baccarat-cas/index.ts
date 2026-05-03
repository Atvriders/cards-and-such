import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { EzBaccaratCasState, EzBaccaratCasAction, EzBaccaratCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EzBaccaratCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: EzBaccaratCasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "bet") return { selector: '[data-testid="hint-target-ez-baccarat-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-ez-baccarat-cas-secondary"]', pulses: 3 };
  return null;
};
export const ezBaccaratCasPlugin: GamePlugin<EzBaccaratCasState, EzBaccaratCasAction, typeof settings> = {
  id: "ez-baccarat-cas", title: "EZ Baccarat", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "EZ Baccarat — no commission on banker bet.",
  howToPlay: "EZ Baccarat — no commission on banker bet. Bet on Player, Banker, or Tie. Cards drawn following baccarat rules. Higher of two totals (mod 10) wins. Player pays 20, Banker pays 20, Tie pays 80.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as EzBaccaratCasSettings),
  reducer, isTerminal, hint: hint, component: EzBaccaratCasGame,
};
