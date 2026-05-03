import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DartsHalveItState, DartsHalveItAction, DartsHalveItSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DartsHalveItGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const dartsHalveItPlugin: GamePlugin<DartsHalveItState, DartsHalveItAction, typeof settings> = {
  id: "darts-halve-it",
  title: "Classic Halve-It",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Classic Halve-It: hit listed targets in order, miss = score halved.',
  howToPlay: 'Classic Halve-It is a real, dice-driven simulation. Classic Halve-It: hit listed targets in order, miss = score halved.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DartsHalveItSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-darts-halve-it-action"]', pulses: 3 }; },
  component: DartsHalveItGame,
};
