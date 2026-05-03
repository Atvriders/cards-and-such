import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WizardCardDuelState, WizardCardDuelAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const WizardCardDuel = /* @__PURE__ */ lazy(() => import("./WizardCardDuel.js").then((mod) => ({ default: mod.WizardCardDuel as unknown as React.ComponentType<unknown> })));
export const wizardCardDuelSettings = {
  handSize: {
    kind: "enum" as const,
    label: "Hand Size",
    options: ["4", "5", "6"] as const,
    default: "5",
  },
} as const;

type WizardCardDuelSettingsType = SettingsOf<typeof wizardCardDuelSettings>;

export const wizardCardDuelPlugin: GamePlugin<WizardCardDuelState, WizardCardDuelAction, typeof wizardCardDuelSettings> = {
  id: "wizard-card-duel",
  title: "Wizard Card Duel",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Duel an opponent wizard by playing spell cards — use elemental advantages to win.",
  howToPlay: `Wizard Card Duel is a strategic card game where you battle an opponent wizard using spell cards. Both players start with 30 HP. The first to reduce the other's HP to zero wins.

Each turn, choose a spell card from your hand and click Cast Spell. Your opponent simultaneously plays a card chosen by the AI. Both spells resolve at the same time, and then each player draws a new card.

There are five spell types. Fire deals solid damage and beats Ice. Ice is reliable and beats Lightning. Lightning is powerful and beats Fire. Exploit these elemental advantages — a winning matchup deals a bonus 4 damage. Shield blocks all non-drain damage from the opponent for one round. Drain steals life — dealing damage and healing you for half the amount, ignoring shields.

The key decision is reading the opponent's likely play. If you expect a fire spell, counter with lightning. If you're low on HP, a shield might buy you a crucial round.

Hand size (4, 5, or 6) controls how many cards you hold at once — more cards means more flexibility in choosing the right matchup.

Score is based on your remaining HP if you win (50 + HP), or your HP × 2 if you lose. High HP wins earn the most points.`,
  settings: wizardCardDuelSettings,
  initialState: (seed: number, settings: WizardCardDuelSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: WizardCardDuelState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-wizard-card-duel-primary"]', pulses: 3 };
  },
  component: WizardCardDuel,
};
