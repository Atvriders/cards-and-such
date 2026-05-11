import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { wavelengthTeamCoopState, wavelengthTeamCoopAction, wavelengthTeamCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const wavelengthTeamCoopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.wavelengthTeamCoopGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const wavelengthTeamCoopPlugin: GamePlugin<wavelengthTeamCoopState, wavelengthTeamCoopAction, typeof settings> = {
  id: "wavelength-team-coop",
  title: "Wavelength (Team Co-op)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative scoring variant — both teams help the cue-giver score.",
  howToPlay: "Wavelength (Team Co-op) is the cooperative scoring variant where both teams help the cue-giver hit the right point on a hidden spectrum. Distilled to ten dice rounds, you and your AI partner roll together to hit a shared target.\n\nEach round, press Play Round. Two dice tumble simultaneously and their sum (2-12) adds to your team score. Press Next Round to advance, or Finish on round ten.\n\nThe team target is 70 points across ten rounds. Hit it and you celebrate with a +50 In-Sync Bonus; miss it and the wavelengths drift apart.\n\nThe original Wavelength uses a half-circle dial and clue-giving over a hidden gradient; this distillation preserves the cooperative both-teams-pulling-together feel without the spectrum dial. A typical run scores around 70, with lucky streaks pushing 80+ and bad streaks falling to 55-60. The team is in sync exactly when the dice are kind.\n\nKeep rolling and hope the spectrum rewards you.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as wavelengthTeamCoopSettings),
  reducer, isTerminal, hint: (state: wavelengthTeamCoopState): HintTarget | null => ((state.phase === "ready" || state.phase === "rolled") ? { selector: ".coop-btn", pulses: 3 } : null), component: wavelengthTeamCoopGame,
};
