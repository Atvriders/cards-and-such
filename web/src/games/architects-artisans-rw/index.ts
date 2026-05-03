import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ArchitectsArtisansRwState, ArchitectsArtisansRwAction, ArchitectsArtisansRwSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ArchitectsArtisansRwGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ArchitectsArtisansRwGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const architectsArtisansRwPlugin: GamePlugin<ArchitectsArtisansRwState, ArchitectsArtisansRwAction, typeof settings> = {
  id: "architects-artisans-rw",
  title: "Architects: Age of Artisans",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Architects roll-and-write building artisan apprentices and journeymen.",
  howToPlay: "Architects: Age of Artisans is a flip-and-write spin-off of Architects of the West Kingdom where you train artisan workers and complete buildings on a personal sheet.\n\nEach turn, click Roll to draw a die (1-6) representing an artisan action level. Click any empty grid cell to assign that artisan to a building project. The pip value records the artisan's skill. If no cell suits, click Skip to pass.\n\nScoring:\n- Each placed artisan scores their pip value (1-6).\n- +5 per fully staffed row (workshop guild complete).\n- +5 per fully staffed column (apprentice-to-journeyman path).\n- +10 for fully completing the artisan ledger (all 16 cells).\n\n12 rolls available. Strategy: place high pips early in long rows or columns to anchor bonuses; lower pips fit anywhere. A baseline run scores 30-50; mastering rows/columns reaches 60+. The Age of Artisans rewards balanced building so try to never have all your high rolls in one row — spread your master craftsmen across guilds for maximum bonus stacking.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ArchitectsArtisansRwSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if ((state as any).phase === "done") return null;
    if ((state as any).phase === "rolling") return { selector: '[data-testid="hint-target-architects-artisans-rw-roll"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-architects-artisans-rw-skip"]', pulses: 3 };
  },
  component: ArchitectsArtisansRwGame,
};
