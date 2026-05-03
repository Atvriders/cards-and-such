import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { Spanish21CasState, Spanish21CasAction, Spanish21CasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Spanish21CasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: Spanish21CasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "play") return { selector: '[data-testid="hint-target-spanish-21-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-spanish-21-cas-secondary"]', pulses: 3 };
  return null;
};
export const spanish21CasPlugin: GamePlugin<Spanish21CasState, Spanish21CasAction, typeof settings> = {
  id: "spanish-21-cas", title: "Spanish 21", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spanish 21 — no 10s in deck. Late surrender allowed.",
  howToPlay: "Spanish 21 — no 10s in deck. Late surrender allowed. Hit to draw, Stand to stop. Bust on 22+ = lose. Doubles down on first two cards. Stand on 17+. Blackjack pays 1.5:1.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as Spanish21CasSettings),
  reducer, isTerminal, hint: hint, component: Spanish21CasGame,
};
