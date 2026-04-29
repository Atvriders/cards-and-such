import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ArchitectsRollAnnexState, ArchitectsRollAnnexAction, ArchitectsRollAnnexSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ArchitectsRollAnnexGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const architectsRollAnnexPlugin: GamePlugin<ArchitectsRollAnnexState, ArchitectsRollAnnexAction, typeof settings> = {
  id: "architects-roll-annex",
  title: "Architects: Roll Annex",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Companion roll mode of Architects; simplified resource sheet.",
  howToPlay: "Architects: Roll Annex is a simplified companion roll-and-write to Architects of the West Kingdom, focused on resource gathering rather than worker placement.\n\nEach turn, click Roll to generate a die value (1-6) representing a resource haul. Click any empty cell on your 4x4 annex sheet to record that resource. The pip value is the resource's strength. Click Skip to forfeit the roll if no cell fits.\n\nScoring:\n- Each cell scores its pip value (1-6).\n- +5 per row complete (caravan delivered).\n- +5 per column complete (warehouse filled).\n- +10 if all 16 cells are filled (annex finished).\n\n12 rolls total. The annex's small footprint rewards efficiency — you can complete it if you avoid skipping. Aim for parallel row+column completions: a single high roll in a key cell can trigger both bonuses. A typical run scores 35-55; perfect filling can reach 70+. Roll Annex is West Kingdom for one-handed sessions: quick, satisfying, and forgiving.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ArchitectsRollAnnexSettings),
  reducer,
  isTerminal,
  component: ArchitectsRollAnnexGame,
};
