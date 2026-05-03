import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PelmanismState, PelmanismAction, PelmanismSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PelmanismGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const pelmanismPlugin: GamePlugin<PelmanismState, PelmanismAction, typeof settings> = {
  id: "pelmanism", title: "Pelmanism", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "British memory pair-matching, the educational classic.",
  howToPlay: "Pelmanism is the British name for Concentration, taught as a memory exercise to schoolchildren in the early 20th century. Twenty cards lie face-down in a 5x4 grid. Each card carries one of ten symbols, and every symbol appears exactly twice.\n\nFlip a card. Flip a second card. If the symbols match, the pair stays revealed and you score 10 points. If not, both cards flip back after a moment. Each two-flip cycle counts as one attempt.\n\nFind all ten pairs to finish. A flawless run — exactly 10 attempts — adds a 40-point perfect bonus. Maximum theoretical score is 140.\n\nThe game tests visual position memory. Watch every revealed mismatch; reveal patterns will guide your next pair. A calm, focused, classic exercise.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PelmanismSettings),
  reducer, isTerminal,
  hint: (state: any) => {
      if (state.phase === "done") return null;
      if (state.flipped && state.flipped.length >= 2) return null;
      const revealed = state.revealed || [];
      const flipped = state.flipped || [];
      for (let i = 0; i < (state.values?.length ?? 0); i++) {
        if (!revealed[i] && !flipped.includes(i)) {
          return { selector: `[data-testid="hint-target-pelmanism-card-${i}"]`, pulses: 3 };
        }
      }
      return null;
    }, component: PelmanismGame,
};
