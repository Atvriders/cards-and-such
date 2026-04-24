import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { WizardTowerState, WizardTowerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WizardTower } from "./Game.js";

export const wizardTowerPlugin = {
  id: "wizard-tower",
  title: "Wizard Tower",
  category: "strategy",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cast spell combos to defeat 5 waves of monsters. Chain spells for bonus damage!",
  howToPlay: `Wizard Tower puts you in the role of a mage defending a tower against five waves of monsters. Each wave brings new enemies to defeat using your arsenal of six spells.

Your spells: Fireball (14 dmg), Ice Lance (8 dmg), Lightning (12 dmg), Arcane Bolt (6 dmg), Mana Shield (+15 block), and Drain (10 dmg + 8 HP leech). Each costs mana to cast.

The key mechanic is spell combos. Certain spell sequences deal bonus damage: Fire after Ice gets +8, Lightning after Fire gets +10, Ice after Lightning gets +6, and Drain after Arcane gets +5. The "COMBO!" indicator lights up when a bonus is available.

When you are done casting, click End Round. Each enemy attacks for its damage value (reduced by your shield), and you regain 2 mana. Use Mana Shield proactively to survive tough rounds.

Defeating all enemies in a wave clears it. You recover 8 HP and full mana between waves. The fifth wave features the powerful Stone Golem — arrive with high HP and good spell chains.

Score = 100 + HP × 2 + mana × 5 on victory.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: WizardTowerState, action: WizardTowerAction) => WizardTowerState,
  isTerminal,
  component: WizardTower,
} as unknown as GamePlugin;
