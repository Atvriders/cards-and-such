import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type WizardSpellCastState, type WizardSpellCastAction } from "./state.js";
const WizardSpellCastGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.WizardSpellCastGame as unknown as React.ComponentType<unknown> })));
const settings = {
  length: {
    kind: "enum" as const,
    label: "Spell Length",
    options: ["4", "6", "8"] as const,
    default: "4" as const,
  },
} as const;

export const wizardSpellCastPlugin: GamePlugin<WizardSpellCastState, WizardSpellCastAction, typeof settings> = {
  id: "wizard-spell-cast",
  title: "Wizard Spell Cast",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Watch the wizard display a sequence of magical runes, then repeat it perfectly!",
  howToPlay: `Wizard Spell Cast is a magical sequence-memory game. The wizard reveals a sequence of elemental runes one at a time — fire, water, nature, lightning, ice, wind, sun, and moon. Each rune lights up briefly before the next appears.

After the full sequence has been shown, it is your turn to cast the spell. Click the rune buttons in the exact same order the wizard demonstrated. If you select the right rune, the next position in the sequence activates. One wrong rune and the spell fails!

Successfully completing a round scores points based on the spell length and which round you are on. Then a new, different sequence appears for the next round. See how many rounds you can complete before making a mistake!

Strategy: say the rune names aloud (or in your head) as they appear — verbal encoding is a powerful memory technique. Visualize a story linking each rune to the next.

Settings: choose spell lengths of 4, 6, or 8 runes. Longer spells are exponentially harder to memorize.`,
  settings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-wizard-spell-cast-action"]', pulses: 3 }; },
  component: WizardSpellCastGame,
};
