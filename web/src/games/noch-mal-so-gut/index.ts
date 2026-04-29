import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { NochMalSoGutState, NochMalSoGutAction, NochMalSoGutSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NochMalSoGutGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const nochMalSoGutPlugin: GamePlugin<NochMalSoGutState, NochMalSoGutAction, typeof settings> = {
  id: "noch-mal-so-gut",
  title: "Noch Mal So Gut",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Revised Noch Mal with new sheets and additional colors.",
  howToPlay: "Noch Mal So Gut is a revised Noch Mal cross-marking dice game with new sheet layouts and a fifth color band. Mark what your dice share to score columns and rows.\n\nEach round, click Roll to draw a die (1-6) representing a color/number combo. Click any empty cell to cross it off. The pip becomes the cell's value. Skip wastes the round when no fitting cell exists — try to avoid skipping more than 3 times (penalty implicit in fewer marks).\n\nScoring:\n- Each crossed cell scores its pip (1-6).\n- +5 per row fully crossed.\n- +5 per column fully crossed.\n- +10 for full sheet (Noch Mal! achievement).\n\n12 rolls available. So Gut adds the fifth band, encouraging breadth across the grid. Strategy: lock in one row or column early to anchor bonuses, then spread remaining rolls. A baseline run scores 35-50; complete mastery reaches 65+. The new sheets demand careful pip placement — high pips in long-line cells double their value via bonuses. So Gut is tighter than the original; every choice matters more.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as NochMalSoGutSettings),
  reducer,
  isTerminal,
  component: NochMalSoGutGame,
};
