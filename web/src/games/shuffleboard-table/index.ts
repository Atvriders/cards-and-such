import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ShuffleboardTableState, ShuffleboardTableAction, ShuffleboardTableSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ShuffleboardTableGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const shuffleboardTablePlugin: GamePlugin<ShuffleboardTableState, ShuffleboardTableAction, typeof settings> = {
  id: "shuffleboard-table",
  title: "Table Shuffleboard",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Table Shuffleboard: shuffle pucks to 1/2/3 zones; closest at end of round scores.',
  howToPlay: 'Table Shuffleboard is a real, dice-driven simulation. Table Shuffleboard: shuffle pucks to 1/2/3 zones; closest at end of round scores.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ShuffleboardTableSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-shuffleboard-table-action"]', pulses: 3 }; },
  component: ShuffleboardTableGame,
};
