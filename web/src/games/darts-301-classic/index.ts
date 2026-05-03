import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { Darts301ClassicState, Darts301ClassicAction, Darts301ClassicSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Darts301ClassicGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const darts301ClassicPlugin: GamePlugin<Darts301ClassicState, Darts301ClassicAction, typeof settings> = {
  id: "darts-301-classic",
  title: "Classic 301 Darts",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Classic 301 Darts: count down from 301 to exactly 0 with simulated darts.',
  howToPlay: 'Classic 301 Darts is a real, dice-driven simulation. Classic 301 Darts: count down from 301 to exactly 0 with simulated darts.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Darts301ClassicSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-darts-301-classic-action"]', pulses: 3 }; },
  component: Darts301ClassicGame,
};
