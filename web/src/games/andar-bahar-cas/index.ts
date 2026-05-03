import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AndarBaharCasState, AndarBaharCasAction, AndarBaharCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AndarBaharCasGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AndarBaharCasGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: AndarBaharCasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "bet") return { selector: '[data-testid="hint-target-andar-bahar-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-andar-bahar-cas-secondary"]', pulses: 3 };
  return null;
};
export const andarBaharCasPlugin: GamePlugin<AndarBaharCasState, AndarBaharCasAction, typeof settings> = {
  id: "andar-bahar-cas", title: "Andar Bahar", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Indian casino card game — bet whether match comes on Andar or Bahar pile.",
  howToPlay: "Andar Bahar is a popular Indian casino card game with extreme simplicity. A single card is flipped as the Joker. Two piles, Andar (left) and Bahar (right), are then alternately dealt cards. You bet on whether a card matching the Joker's rank will appear first on the Andar or Bahar pile.\n\nEach round you choose Andar or Bahar, place a one-credit bet, and the engine deals cards alternately until a match is found. The first match's pile resolves the bet.\n\nTwelve rounds are played. A correct guess pays twelve points if the match takes one to three cards; pays sixteen for a four-to-six-card chain; pays twenty for any longer chain. A wrong guess pays zero.\n\nExpected score is around fifty-five points across twelve rounds; the longer-chain bonuses can push past 100 if the deal stretches out a few times. Bahar (the right pile) wins slightly more often when the Joker is dealt first to Andar (which is the typical Indian dealing order), giving a thin edge. A streak of long deals is the only way to push past 150 in twelve rounds.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AndarBaharCasSettings),
  reducer, isTerminal, hint: hint, component: AndarBaharCasGame,
};
