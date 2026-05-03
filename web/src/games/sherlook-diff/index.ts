import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SherlookDiffState, SherlookDiffAction, SherlookDiffSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SherlookDiffGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const sherlookDiffPlugin: GamePlugin<SherlookDiffState, SherlookDiffAction, typeof settings> = {
  id: "sherlook-diff", title: "Sherlook Differences", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spot the panel that differs from three identical ones.",
  howToPlay: "Sherlook Differences is the spot-the-different game in 2x2 panel form. Each of fifteen rounds shows four colored squares — three are the same color, one is different. Tap the odd one, hit Submit, score ten points. Fifteen rounds, max 150 points. The color pool draws from fifteen distinct hues (blue, green, red, yellow, purple, orange, black, white, brown, plus additional warm and cool tones) so different rounds feel fresh. The challenge is a pure visual-discrimination test — there is no logic puzzle, just rapid scan and tap. Children find this addictive; adults breeze through. Solid players score perfect 150 in under a minute. The original Sherlook game uses ten hidden differences between two illustrated cards; this digital version captures the spotting-instinct in single-color-swatch form for a faster, brisker drill. Hit Submit, then Next. Use as a warm-up before color-sensitive design tasks.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SherlookDiffSettings),
  reducer, isTerminal, hint: (state: SherlookDiffState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-sherlook-diff-answer-0"]', pulses: 3 } : null, component: SherlookDiffGame,
};
