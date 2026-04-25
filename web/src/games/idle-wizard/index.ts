import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type IdleWizardState, type IdleWizardAction } from "./state.js";
import { IdleWizard } from "./IdleWizard.js";

export const idleWizardSettings = {
  spells: { kind: "enum" as const, label: "Spells to Cast", options: ["10", "25", "50"] as const, default: "10" as const },
} as const;

export const idleWizardPlugin: GamePlugin<IdleWizardState, IdleWizardAction, typeof idleWizardSettings> = {
  id: "idle-wizard",
  title: "Idle Wizard",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cast spells, hire apprentices, study tomes — master arcane arts through idle magic.",
  howToPlay: `Idle Wizard drops you into a magical tower where you must cast a set number of spells — 10, 25, or 50 depending on difficulty — to complete your arcane training.

Click the crystal ball to cast spells. Each cast earns mana equal to your Spell Power multiplied by the number of Tomes you own. Tomes are ancient books that amplify all magical output, and you start with one.

Spend your accumulated mana to hire Apprentices. Each apprentice automatically casts spells every second and also increases your base Spell Power by 2. More apprentices means faster spell casting and more mana generation.

You can also purchase additional Tomes from the arcane library. Each new Tome multiplies all mana production — from clicks and apprentices alike. Tomes are expensive but the multiplicative bonus is enormous.

There is a 10% chance of a Critical Spell on each manual cast, doubling the mana earned. The progress bar tracks how many spells you have cast toward your goal.

Strategy tip: buy Tomes as aggressively as possible once you can afford them. The spell multiplier compounds with every apprentice you own, making Tomes the highest-value upgrade in your arsenal.`,
  settings: idleWizardSettings,
  initialState,
  reducer,
  isTerminal,
  component: IdleWizard,
};
