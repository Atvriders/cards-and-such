import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { SigilWizardState, SigilWizardAction, SigilWizardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SigilWizardGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const sigilWizardPlugin: GamePlugin<SigilWizardState, SigilWizardAction, typeof settings> = {
  id: "sigil-wizard",
  title: "SIGIL Wizard",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo journaling homage — create a wizard via tarot-and-oracle pulls.",
  howToPlay: "SIGIL Wizard is a solo journaling homage to Will Jobst's SIGIL, a tarot-driven game in which the player constructs a wizard's life history through oracle pulls. The original uses tarot prompts and rich tables; this homage compresses to ten choice-driven entries.\n\nEach prompt asks you about your wizard — apprenticeships, spells learned, friends made, enemies sworn. Pick one of four choices A-D; each assigns a base reward plus 0-20 of variance via the seeded mulberry32 oracle.\n\nSome choices feel more colorful than others, but the scoring is intentionally generous-and-soft, like the tarot itself: there are no truly bad answers, just different paths to wizardhood. The total at the end is your wizard's \"weight of years.\"\n\nImagine candle smoke, ink-stained sleeves, and a familiar with strong opinions. The wand is patient. Choose.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SigilWizardSettings),
  reducer, isTerminal, hint: (state: SigilWizardState): HintTarget | null => (state.phase === "choose" ? { selector: '[data-testid="hint-target-sigil-wizard-primary"]', pulses: 3 } : null), component: SigilWizardGame,
};
